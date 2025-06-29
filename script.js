let currentUser = null;
        let searchCount = 0;
        const MAX_FREE_SEARCHES = 5;
        
        // Sample influencer data
        const sampleInfluencers = [
            {
                name: "Sarah Johnson",
                niche: "Fashion & Lifestyle",
                followers: "2.3M",
                engagement: "4.2%",
                platform: "Instagram"
            },
            {
                name: "Tech Guru Mike",
                niche: "Technology",
                followers: "1.8M",
                engagement: "6.1%",
                platform: "YouTube"
            },
            {
                name: "Fitness Queen Lisa",
                niche: "Health & Fitness",
                followers: "3.1M",
                engagement: "5.8%",
                platform: "Instagram"
            },
            {
                name: "Foodie Explorer",
                niche: "Food & Travel",
                followers: "1.2M",
                engagement: "7.3%",
                platform: "TikTok"
            },
            {
                name: "Beauty Blogger Emma",
                niche: "Beauty & Skincare",
                followers: "2.7M",
                engagement: "4.9%",
                platform: "Instagram"
            }
        ];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadUserData();
            updateUI();
        });

        // User Management Functions
        function signup(event) {
            event.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(user => user.email === email)) {
                showAlert('User already exists! Please login instead.', 'danger');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password, // In production, this should be hashed
                credits: 5, // Start with 5 free trial searches
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto login
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            closeModal('signupModal');
            showAlert('Account created successfully! You have 5 free searches.', 'success');
            updateUI();
        }

        function login(event) {
            event.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                closeModal('loginModal');
                showAlert('Welcome back!', 'success');
                updateUI();
            } else {
                showAlert('Invalid email or password!', 'danger');
            }
        }

        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            searchCount = 0;
            updateUI();
            showAlert('Logged out successfully!', 'success');
        }

        function loadUserData() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
            }
        }

        // Search Functions
        function searchInfluencers(event) {
            event.preventDefault();
            
            const query = document.getElementById('searchInput').value.trim();
            if (!query) return;
            
            // Check if user can perform search
            if (!canPerformSearch()) {
                if (!currentUser) {
                    showAlert('Please sign up to continue searching!', 'warning');
                    showModal('signupModal');
                } else {
                    showAlert('You\'ve run out of credits! Buy more to continue searching.', 'warning');
                    showModal('paymentModal');
                }
                return;
            }
            
            // Perform search
            const results = sampleInfluencers.filter(influencer => 
                influencer.name.toLowerCase().includes(query.toLowerCase()) ||
                influencer.niche.toLowerCase().includes(query.toLowerCase())
            );
            
            // Update search count
            if (currentUser) {
                currentUser.credits--;
                updateUserInStorage();
            } else {
                searchCount++;
            }
            
            displayResults(results, query);
            updateUI();
        }

        function canPerformSearch() {
            if (currentUser) {
                return currentUser.credits > 0;
            } else {
                return searchCount < MAX_FREE_SEARCHES;
            }
        }

        function displayResults(results, query) {
            const resultsContainer = document.getElementById('searchResults');
            
            if (results.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; color: #666; grid-column: 1/-1;">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p>No influencers found for "${query}". Try different keywords!</p>
                    </div>
                `;
                return;
            }
            
            resultsContainer.innerHTML = results.map(influencer => `
                <div class="influencer-card">
                    <div class="influencer-avatar">
                        ${influencer.name.charAt(0)}
                    </div>
                    <h3 style="margin-bottom: 0.5rem; color: #333;">${influencer.name}</h3>
                    <p style="color: #667eea; font-weight: 600; margin-bottom: 0.5rem;">${influencer.niche}</p>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #666;"><i class="fas fa-users"></i> ${influencer.followers}</span>
                        <span style="color: #666;"><i class="fas fa-heart"></i> ${influencer.engagement}</span>
                    </div>
                    <div style="background: rgba(102, 126, 234, 0.1); padding: 0.5rem; border-radius: 5px; text-align: center;">
                        <i class="fab fa-${influencer.platform.toLowerCase()}"></i> ${influencer.platform}
                    </div>
                </div>
            `).join('');
        }

        // Payment Functions
        function initiatePayment() {
            if (!currentUser) {
                showAlert('Please login first!', 'warning');
                return;
            }
            
            const options = {
                key: 'rzp_test_1234567890', // Replace with your Razorpay test key
                amount: 29900, // Amount in paise (₹299)
                currency: 'INR',
                name: 'InfluencerHub',
                description: '100 Premium Search Credits',
                image: 'https://via.placeholder.com/100x100/667eea/ffffff?text=IH',
                order_id: 'order_' + Date.now(), // Generate order ID
                handler: function(response) {
                    handlePaymentSuccess(response);
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: currentUser.phone || ''
                },
                notes: {
                    user_id: currentUser.id,
                    package: '100_credits'
                },
                theme: {
                    color: '#667eea'
                }
            };
            
            const rzp = new Razorpay(options);
            
            rzp.on('payment.failed', function(response) {
                showAlert('Payment failed! Please try again.', 'danger');
                console.error('Payment failed:', response.error);
            });
            
            rzp.open();
        }

        function handlePaymentSuccess(response) {
            // In production, verify payment on server side
            console.log('Payment successful:', response);
            
            // Add credits to user account
            currentUser.credits += 100;
            currentUser.lastPayment = {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: 299,
                date: new Date().toISOString()
            };
            
            updateUserInStorage();
            closeModal('paymentModal');
            showAlert('Payment successful! 100 credits added to your account.', 'success');
            updateUI();
        }

        // UI Helper Functions
        function updateUI() {
            const authButtons = document.getElementById('authButtons');
            const userButtons = document.getElementById('userButtons');
            const creditsDisplay = document.getElementById('creditsDisplay');
            const trialInfo = document.getElementById('trialInfo');
            
            if (currentUser) {
                // User is logged in
                authButtons.classList.add('hidden');
                userButtons.classList.remove('hidden');
                creditsDisplay.classList.remove('hidden');
                trialInfo.classList.add('hidden');
                
                document.getElementById('creditsCount').textContent = currentUser.credits;
            } else {
                // User is not logged in
                authButtons.classList.remove('hidden');
                userButtons.classList.add('hidden');
                creditsDisplay.classList.add('hidden');
                trialInfo.classList.remove('hidden');
                
                // Update trial info
                const remaining = MAX_FREE_SEARCHES - searchCount;
                if (remaining > 0) {
                    trialInfo.innerHTML = `🎉 Free Trial: ${remaining} searches remaining! Sign up to track your usage and buy more credits.`;
                } else {
                    trialInfo.innerHTML = `⚠️ Free trial expired! Sign up to continue searching.`;
                    trialInfo.style.background = 'linear-gradient(45deg, #e74c3c 0%, #c0392b 100%)';
                }
            }
        }

        function updateUserInStorage() {
            if (!currentUser) return;
            
            // Update in current session
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update in users array
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        function showModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        function showAlert(message, type) {
            const alertContainer = document.getElementById('alertContainer');
            const alertId = 'alert_' + Date.now();
            
            const alertHTML = `
                <div id="${alertId}" class="alert alert-${type}" style="display: block;">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                    ${message}
                </div>
            `;
            
            alertContainer.innerHTML = alertHTML;
            
            // Auto remove alert after 5 seconds
            setTimeout(() => {
                const alertElement = document.getElementById(alertId);
                if (alertElement) {
                    alertElement.remove();
                }
            }, 5000);
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }