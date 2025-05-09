
// Social authentication functionality for WordPress Automation Tool
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google OAuth client
    function initGoogleAuth() {
        if (typeof google !== 'undefined' && google.accounts) {
            try {
                google.accounts.id.initialize({
                    client_id: '123456789-example.apps.googleusercontent.com', // Replace with your actual client ID
                    callback: handleGoogleCallback,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });

                // Display Google Sign-In button
                google.accounts.id.renderButton(
                    document.querySelector('.google-login') || document.createElement('div'),
                    { theme: 'outline', size: 'large', width: '100%' }
                );
            } catch (error) {
                console.error('Google Sign-In initialization error:', error);
                fallbackToSimulatedAuth();
            }
        } else {
            console.warn('Google Identity Services not loaded');
            fallbackToSimulatedAuth();
        }
    }

    // Handle Google Sign-In callback
    function handleGoogleCallback(response) {
        if (response.credential) {
            // Send the ID token to your server
            fetch('/auth/google/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: response.credential
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Redirect to dashboard or refresh the page
                    window.location.href = data.redirect || '/dashboard';
                } else {
                    showError(data.error || 'Authentication failed');
                }
            })
            .catch(error => {
                console.error('Google auth server error:', error);
                showError('Server error during authentication');
            });
        }
    }

    // Initialize Facebook SDK
    function initFacebookAuth() {
        if (typeof FB !== 'undefined') {
            try {
                FB.init({
                    appId: '123456789012345', // Replace with your actual FB App ID
                    cookie: true,
                    xfbml: true,
                    version: 'v17.0'
                });
                
                // Listen for Facebook login events
                document.querySelectorAll('.facebook-login').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        FB.login(handleFacebookCallback, { 
                            scope: 'public_profile,email' 
                        });
                    });
                });
            } catch (error) {
                console.error('Facebook SDK initialization error:', error);
                fallbackToSimulatedAuth();
            }
        } else {
            console.warn('Facebook SDK not loaded');
            fallbackToSimulatedAuth();
        }
    }

    // Handle Facebook login callback
    function handleFacebookCallback(response) {
        if (response.status === 'connected') {
            // Get user details
            FB.api('/me', { fields: 'email,name' }, function(userData) {
                // Send token to server
                fetch('/auth/facebook/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accessToken: response.authResponse.accessToken,
                        userData: userData
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Redirect to dashboard or refresh the page
                        window.location.href = data.redirect || '/dashboard';
                    } else {
                        showError(data.error || 'Authentication failed');
                    }
                })
                .catch(error => {
                    console.error('Facebook auth server error:', error);
                    showError('Server error during authentication');
                });
            });
        } else {
            console.log('Facebook login canceled or failed');
        }
    }

    // Fallback to simulated auth for development/demo
    function fallbackToSimulatedAuth() {
        console.log('Using simulated authentication for development');
        
        // Google login handler (development/demo mode)
        const googleButtons = document.querySelectorAll('.google-login');
        googleButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting to Google...';
                this.disabled = true;
                
                // Simulate delay for a more realistic flow
                setTimeout(() => {
                    // In real implementation, this would open Google OAuth flow
                    // For demo purposes, we'll simulate a successful login
                    simulateSocialLogin('google');
                    
                    // Reset button
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1500);
            });
        });
        
        // Facebook login handler (development/demo mode)
        const facebookButtons = document.querySelectorAll('.facebook-login');
        facebookButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting to Facebook...';
                this.disabled = true;
                
                // Simulate delay for a more realistic flow
                setTimeout(() => {
                    // In real implementation, this would open Facebook OAuth flow
                    // For demo purposes, we'll simulate a successful login
                    simulateSocialLogin('facebook');
                    
                    // Reset button
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1500);
            });
        });
    }
    
    // Simulate social login (for development/demo)
    function simulateSocialLogin(provider) {
        // In a real implementation, this would handle the OAuth callback
        // and send the token to the server
        
        // For demo purposes, generate random email and redirect to simulated endpoint
        const email = `${provider}_user_${Math.floor(Math.random() * 10000)}@example.com`;
        
        // Show a loading indicator
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'alert alert-info mt-3';
        loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Authenticating with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`;
        document.querySelector('form')?.insertAdjacentElement('afterend', loadingMsg);
        
        // Simulate server request
        setTimeout(() => {
            // Redirect to appropriate provider endpoint
            window.location.href = `/${provider}_login?email=${encodeURIComponent(email)}`;
        }, 1000);
    }
    
    // Show authentication error
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
        
        // Find a suitable place to show the error
        const container = document.querySelector('.login-container') || 
                          document.querySelector('form') || 
                          document.body;
        
        container.prepend(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Load social auth SDKs
    function loadSocialSDKs() {
        // Check if we need to load the social SDKs
        const socialButtons = document.querySelectorAll('.google-login, .facebook-login');
        if (socialButtons.length === 0) return;
        
        // Load Google Identity Services script if needed
        if (document.querySelector('.google-login')) {
            const googleScript = document.createElement('script');
            googleScript.src = 'https://accounts.google.com/gsi/client';
            googleScript.async = true;
            googleScript.defer = true;
            googleScript.onload = initGoogleAuth;
            googleScript.onerror = fallbackToSimulatedAuth;
            document.head.appendChild(googleScript);
        }
        
        // Load Facebook SDK if needed
        if (document.querySelector('.facebook-login')) {
            const fbScript = document.createElement('script');
            fbScript.src = 'https://connect.facebook.net/en_US/sdk.js';
            fbScript.async = true;
            fbScript.defer = true;
            fbScript.onload = initFacebookAuth;
            fbScript.onerror = fallbackToSimulatedAuth;
            document.head.appendChild(fbScript);
        }
    }

    // Initialize social authentication
    try {
        loadSocialSDKs();
    } catch (error) {
        console.error('Error initializing social auth:', error);
        fallbackToSimulatedAuth();
    }
});
