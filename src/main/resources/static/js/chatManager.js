/**
 * Chat Manager
 * 
 * Quản lý các chức năng chat trong ứng dụng:
 * - Kết nối WebSocket
 * - Quản lý tin nhắn
 * - Giao diện chat
 * 
 * Chế độ giả lập (Simulation Mode):
 * Khi API hoặc WebSocket chưa sẵn sàng, module này sẽ tự động chuyển sang chế độ giả lập.
 * Để bật chế độ giả lập chủ động, hãy thêm cấu hình sau vào trang HTML:
 * 
 * <script>
 *   window.laundryConfig = {
 *     simulationMode: true,
 *     debug: false
 *   };
 * </script>
 */
window.chatManager = {
    // Dữ liệu chat
    chatData: {
        conversations: {}, // Danh sách các cuộc trò chuyện theo id
        activeConversation: null, // Cuộc trò chuyện đang hiển thị
        unreadCount: 0, // Số tin nhắn chưa đọc
        isShopOwner: false, // Flag để xác định người dùng là chủ shop hay khách hàng
        customers: [], // Danh sách khách hàng (chỉ dùng cho chủ cửa hàng)
        websocket: null // WebSocket connection
    },

    // Khởi tạo chatManager
    init(isShopOwner = false) {
        this.chatData.isShopOwner = isShopOwner;
        
        // Lấy dữ liệu người dùng từ localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            this.chatData.currentUser = JSON.parse(userData);
        }
        
        // Khởi tạo websocket để nhận tin nhắn thời gian thực
        this.initWebSocketConnection();
        
        // Load các cuộc trò chuyện đã có
        this.loadConversations();
        
        // Thêm các event listeners
        this.setupEventListeners();
        
        // Nếu là chủ cửa hàng, load danh sách khách hàng
        if (isShopOwner) {
            this.loadCustomers();
            this.setupCustomerListUI();
        }
        
        // Cập nhật trạng thái ban đầu của giao diện
        this.updateChatInterface();
        
        console.log('Chat Manager initialized as', isShopOwner ? 'Shop Owner' : 'Customer');
    },

    // Khởi tạo kết nối WebSocket
    initWebSocketConnection() {
        try {
            // Kiểm tra nếu đang ở chế độ phát triển/giả lập
            if (window.laundryConfig && window.laundryConfig.simulationMode) {
                console.log('Đang ở chế độ giả lập, không kết nối WebSocket.');
                this.initSimulationMode();
                return;
            }
            
            // Kiểm tra xem Stomp đã được định nghĩa chưa
            if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
                console.warn('SockJS hoặc Stomp chưa được tải. Sử dụng chế độ giả lập.');
                this.initSimulationMode();
                return;
            }

            // Khởi tạo kết nối SockJS và STOMP
            const socket = new SockJS('/ws/chat');
            const stompClient = Stomp.over(socket);
            
            const userId = this.chatData.currentUser?.userId || 'anonymous';
            const userType = this.chatData.isShopOwner ? 'shop' : 'customer';
            
            // Ẩn các log debug của STOMP
            stompClient.debug = null;
            
            stompClient.connect({
                userId: userId,
                userType: userType
            }, frame => {
                console.log('Connected to WebSocket: ' + frame);
                this.chatData.websocket = stompClient;
                
                // Đăng ký nhận tin nhắn cá nhân
                stompClient.subscribe(`/user/${userId}/queue/messages`, message => {
                    const receivedMessage = JSON.parse(message.body);
                    this.handleReceivedMessage(receivedMessage);
                });
                
                // Đăng ký nhận thông báo đã đọc
                stompClient.subscribe(`/user/${userId}/queue/read-receipts`, receipt => {
                    const readReceipt = JSON.parse(receipt.body);
                    this.handleReadReceipt(readReceipt);
                });
                
                // Thông báo trạng thái online
                this.sendUserStatus('ONLINE');
            }, error => {
                console.error('WebSocket connection error:', error);
                // Fallback về chế độ giả lập
                console.log('Falling back to simulation mode');
                this.initSimulationMode();
            });
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            // Fallback về chế độ giả lập
            console.log('Falling back to simulation mode');
            this.initSimulationMode();
        }
    },
    
    // Khởi tạo chế độ giả lập (fallback)
    initSimulationMode() {
        console.log('Initializing simulation mode');
        // Sử dụng polling thay thế cho WebSocket khi cần thiết
        if (this.messageCheckInterval) {
            clearInterval(this.messageCheckInterval);
        }
        this.messageCheckInterval = setInterval(() => {
            this.checkNewMessages();
        }, 3000);
        
        // Tạo cuộc trò chuyện giả lập nếu chưa có
        this.loadSimulatedConversations();
    },

    // Thêm tin nhắn vào cuộc trò chuyện
    addMessageToConversation(message) {
        const conversationId = message.conversationId || 'default';
        
        // Tạo cuộc trò chuyện mới nếu chưa có
        if (!this.chatData.conversations[conversationId]) {
            this.chatData.conversations[conversationId] = [];
        }
        
        // Kiểm tra xem tin nhắn đã tồn tại chưa
        const existingMessage = this.chatData.conversations[conversationId].find(
            msg => msg.id === message.id
        );
        
        if (!existingMessage) {
            // Thêm tin nhắn mới
            this.chatData.conversations[conversationId].push({
                id: message.id,
                sender: message.sender,
                senderName: message.senderName,
                content: message.content,
                timestamp: message.timestamp,
                isRead: false
            });
            
            // Tăng số tin nhắn chưa đọc
            if (message.sender !== (this.chatData.isShopOwner ? 'shop' : 'customer')) {
                this.chatData.unreadCount++;
            }
            
            // Cập nhật giao diện
            this.updateChatInterface();
            
            // Hiển thị thông báo
            this.showNotification(message.senderName, message.content);
        }
    },

    // Cập nhật trạng thái người dùng
    updateUserStatus(message) {
        if (this.chatData.isShopOwner && message.userType === 'customer') {
            // Tìm khách hàng trong danh sách
            const customer = this.chatData.customers.find(c => c.id === message.userId);
            if (customer) {
                // Cập nhật trạng thái
                customer.lastActive = new Date();
                // Cập nhật UI
                this.updateCustomerListUI();
            }
        }
    },

    // Load các cuộc trò chuyện đã có
    async loadConversations() {
        try {
            // Kiểm tra nếu đang ở chế độ phát triển/giả lập
            if (window.laundryConfig && window.laundryConfig.simulationMode) {
                console.log('Đang ở chế độ giả lập, sử dụng dữ liệu mẫu.');
                this.loadSimulatedConversations();
                this.updateChatInterface();
                return;
            }
            
            // Trong triển khai thực tế, bạn sẽ gọi API để lấy lịch sử trò chuyện
            const userId = this.chatData.currentUser?.userId || 'anonymous';
            const userType = this.chatData.isShopOwner ? 'shop' : 'customer';
            
            console.log(`Đang tải cuộc trò chuyện cho ${userType}/${userId}`);
            
            // Sử dụng try-catch bên trong để xử lý lỗi fetch API
            try {
                const response = await fetch(`/api/chat/conversations/${userType}/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    // Chuyển đổi dữ liệu từ API về đúng format
                    data.forEach(conversation => {
                        this.chatData.conversations[conversation.id] = conversation.messages;
                    });
                    
                    // Đặt cuộc trò chuyện active mặc định
                    if (data.length > 0) {
                        this.chatData.activeConversation = data[0].id;
                    }
                    
                    console.log('Đã tải cuộc trò chuyện thành công từ API.');
                } else {
                    console.warn(`API trả về lỗi ${response.status} - Sử dụng dữ liệu giả lập`);
                    // Fallback to simulation data
                    this.loadSimulatedConversations();
                }
            } catch (error) {
                console.warn('Không thể kết nối đến API, sử dụng dữ liệu giả lập:', error.message);
                // Fallback to simulation data
                this.loadSimulatedConversations();
            }
            
            this.updateChatInterface();
        } catch (error) {
            console.error('Lỗi khi tải cuộc trò chuyện:', error);
            // Fallback to simulation data
            this.loadSimulatedConversations();
            this.updateChatInterface();
        }
    },
    
    // Load cuộc trò chuyện giả lập (fallback)
    loadSimulatedConversations() {
        const demoConversation = {
            id: 'default',
            messages: [
                {
                    id: 1,
                    sender: this.chatData.isShopOwner ? 'shop' : 'customer',
                    senderName: this.chatData.isShopOwner ? 'Bạn' : 'Bạn',
                    content: 'Xin chào!',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    isRead: true
                },
                {
                    id: 2,
                    sender: this.chatData.isShopOwner ? 'customer' : 'shop',
                    senderName: this.chatData.isShopOwner ? 'Khách hàng' : 'Chủ cửa hàng',
                    content: 'Xin chào! Tôi có thể giúp gì cho bạn?',
                    timestamp: new Date(Date.now() - 3500000).toISOString(),
                    isRead: true
                }
            ]
        };
        
        this.chatData.conversations[demoConversation.id] = demoConversation.messages;
        this.chatData.activeConversation = demoConversation.id;
    },

    // Load danh sách khách hàng (chỉ cho chủ cửa hàng)
    async loadCustomers() {
        if (!this.chatData.isShopOwner) return;
        
        try {
            // Kiểm tra nếu đang ở chế độ phát triển/giả lập
            if (window.laundryConfig && window.laundryConfig.simulationMode) {
                console.log('Đang ở chế độ giả lập, sử dụng dữ liệu mẫu cho danh sách khách hàng.');
                this.loadSimulatedCustomers();
                this.updateCustomerListUI();
                return;
            }
            
            console.log('Đang tải danh sách khách hàng...');
            // Trong triển khai thực tế, bạn sẽ gọi API để lấy danh sách khách hàng
            try {
                const response = await fetch('/api/chat/shop/customers');
                if (response.ok) {
                    const data = await response.json();
                    this.chatData.customers = data;
                    console.log('Đã tải danh sách khách hàng thành công từ API.');
                } else {
                    console.warn(`API trả về lỗi ${response.status} - Sử dụng dữ liệu giả lập`);
                    // Fallback to simulation data if API fails
                    this.loadSimulatedCustomers();
                }
            } catch (error) {
                console.warn('Không thể kết nối đến API, sử dụng dữ liệu giả lập:', error.message);
                // Fallback to simulation data
                this.loadSimulatedCustomers();
            }
            
            // Cập nhật UI
            this.updateCustomerListUI();
        } catch (error) {
            console.error('Lỗi khi tải danh sách khách hàng:', error);
            // Fallback to simulation data
            this.loadSimulatedCustomers();
            this.updateCustomerListUI();
        }
    },

    // Tải danh sách khách hàng giả lập
    loadSimulatedCustomers() {
        console.log('Tạo danh sách khách hàng giả lập');
        this.chatData.customers = [
            { id: 'customer1', name: 'Nguyễn Văn A', lastActive: new Date(Date.now() - 5 * 60000) },
            { id: 'customer2', name: 'Trần Thị B', lastActive: new Date(Date.now() - 30 * 60000) },
            { id: 'customer3', name: 'Lê Văn C', lastActive: new Date(Date.now() - 2 * 3600000) },
            { id: 'customer4', name: 'Phạm Thị D', lastActive: new Date() }
        ];
    },

    // Thiết lập UI danh sách khách hàng
    setupCustomerListUI() {
        if (!this.chatData.isShopOwner) return;
        
        // Tạo và thêm UI danh sách khách hàng
        const chatWidget = document.querySelector('.chat-widget');
        if (!chatWidget) return;
        
        const customerListContainer = document.createElement('div');
        customerListContainer.className = 'customer-list-container bg-white rounded-lg shadow-lg';
        customerListContainer.style = `
            position: fixed;
            bottom: 90px;
            right: 390px;
            width: 280px;
            height: 480px;
            display: none;
            flex-direction: column;
            z-index: 999;
        `;
        
        customerListContainer.innerHTML = `
            <div class="bg-[#1F2937] text-white p-3 font-semibold">
                Danh sách khách hàng
            </div>
            <div class="p-2">
                <input type="text" placeholder="Tìm kiếm khách hàng..." class="customer-search w-full p-2 border rounded">
            </div>
            <div class="customer-list flex-1 overflow-y-auto p-2">
                <!-- Danh sách khách hàng sẽ được render ở đây -->
            </div>
        `;
        
        document.body.appendChild(customerListContainer);
        
        // Thêm nút để hiển thị danh sách khách hàng
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            const customerListButton = document.createElement('button');
            customerListButton.className = 'text-white';
            customerListButton.innerHTML = '<i class="fas fa-users"></i>';
            customerListButton.onclick = () => this.toggleCustomerList();
            
            chatHeader.insertBefore(customerListButton, chatHeader.querySelector('.chat-close-button'));
        }
    },

    // Hiển thị/ẩn danh sách khách hàng
    toggleCustomerList() {
        const customerListContainer = document.querySelector('.customer-list-container');
        if (customerListContainer) {
            if (customerListContainer.style.display === 'none' || customerListContainer.style.display === '') {
                customerListContainer.style.display = 'flex';
                this.updateCustomerListUI();
            } else {
                customerListContainer.style.display = 'none';
            }
        }
    },

    // Cập nhật UI danh sách khách hàng
    updateCustomerListUI() {
        if (!this.chatData.isShopOwner) return;
        
        const customerList = document.querySelector('.customer-list');
        if (!customerList || !this.chatData.customers.length) return;
        
        const searchInput = document.querySelector('.customer-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filteredCustomers = searchTerm 
            ? this.chatData.customers.filter(c => c.name.toLowerCase().includes(searchTerm))
            : this.chatData.customers;
        
        customerList.innerHTML = filteredCustomers.map(customer => `
            <div class="customer-item p-3 border-b hover:bg-gray-100 cursor-pointer flex items-center justify-between" data-customer-id="${customer.id}">
                <div>
                    <div class="font-medium">${customer.name}</div>
                    <div class="text-xs text-gray-500">${this.formatLastActive(customer.lastActive)}</div>
                </div>
                <div class="w-3 h-3 rounded-full ${this.isActiveNow(customer.lastActive) ? 'bg-green-500' : 'bg-gray-300'}"></div>
            </div>
        `).join('');
        
        // Thêm event listeners
        const customerItems = customerList.querySelectorAll('.customer-item');
        customerItems.forEach(item => {
            item.addEventListener('click', () => {
                const customerId = item.dataset.customerId;
                this.chatData.activeConversation = customerId;
                
                // Tạo cuộc trò chuyện mới nếu chưa có
                if (!this.chatData.conversations[customerId]) {
                    this.chatData.conversations[customerId] = [];
                }
                
                // Hiển thị cuộc trò chuyện với khách hàng này
                this.updateMessageList();
                
                // Ẩn danh sách khách hàng
                const customerListContainer = document.querySelector('.customer-list-container');
                if (customerListContainer) {
                    customerListContainer.style.display = 'none';
                }
                
                // Hiển thị chat container nếu chưa hiện
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer && !chatContainer.classList.contains('chat-open')) {
                    chatContainer.style.display = 'flex';
                    chatContainer.classList.add('chat-open');
                }
                
                // Cập nhật tiêu đề chat
                const chatTitle = document.querySelector('.chat-title');
                if (chatTitle) {
                    const selectedCustomer = this.chatData.customers.find(c => c.id === customerId);
                    if (selectedCustomer) {
                        chatTitle.textContent = `Chat với ${selectedCustomer.name}`;
                    }
                }
            });
        });
        
        // Xử lý tìm kiếm
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.updateCustomerListUI();
            });
        }
    },

    // Kiểm tra xem khách hàng có đang active không
    isActiveNow(lastActive) {
        return (new Date() - new Date(lastActive)) < 10 * 60000; // 10 phút
    },

    // Định dạng thời gian last active
    formatLastActive(lastActive) {
        const minutes = Math.floor((new Date() - new Date(lastActive)) / 60000);
        
        if (minutes < 1) return 'Vừa hoạt động';
        if (minutes < 60) return `Hoạt động ${minutes} phút trước`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hoạt động ${hours} giờ trước`;
        
        return `Hoạt động ${Math.floor(hours / 24)} ngày trước`;
    },

    // Kiểm tra tin nhắn mới (fallback cho chế độ giả lập)
    async checkNewMessages() {
        try {
            // Thay thế bằng API call thật trong triển khai thực tế
            const userId = this.chatData.currentUser?.userId || 'anonymous';
            const endpoint = this.chatData.isShopOwner 
                ? `/api/chat/shop/${userId}/messages/new`
                : `/api/chat/customer/${userId}/messages/new`;
            
            // Giả lập API call
            // Trong triển khai thật, bạn sẽ gọi fetch(endpoint)
            
            // Giả lập có tin nhắn mới sau khoảng thời gian ngẫu nhiên
            if (Math.random() < 0.3) { // 30% cơ hội có tin nhắn mới
                this.simulateNewMessage();
            }
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    },

    // Giả lập nhận tin nhắn mới (chỉ dùng khi WebSocket không khả dụng)
    simulateNewMessage() {
        const conversationId = this.chatData.activeConversation || 'default';
        
        if (!this.chatData.conversations[conversationId]) {
            this.chatData.conversations[conversationId] = [];
        }
        
        // Danh sách các tin nhắn giả lập
        const demoMessages = [
            'Xin chào, tôi có thể giúp gì cho bạn?',
            'Cửa hàng có đang có khuyến mãi không?',
            'Đơn hàng của tôi sẽ hoàn thành khi nào?',
            'Bạn có thể giao hàng đến địa chỉ khác không?',
            'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.'
        ];
        
        const newMessage = {
            id: Date.now(),
            sender: this.chatData.isShopOwner ? 'customer' : 'shop',
            senderName: this.chatData.isShopOwner ? 'Khách hàng' : 'Chủ cửa hàng',
            content: demoMessages[Math.floor(Math.random() * demoMessages.length)],
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        this.chatData.conversations[conversationId].push(newMessage);
        this.chatData.unreadCount++;
        
        // Cập nhật giao diện
        this.updateChatInterface();
        
        // Hiển thị thông báo
        this.showNotification(newMessage.senderName, newMessage.content);
    },

    // Giả lập phản hồi từ bên kia
    simulateResponse(conversationId) {
        if (!conversationId) {
            conversationId = this.chatData.activeConversation || 'default';
        }
        
        if (!this.chatData.conversations[conversationId]) {
            this.chatData.conversations[conversationId] = [];
        }
        
        console.log('Đang giả lập phản hồi cho cuộc trò chuyện:', conversationId);
        
        // Danh sách các tin nhắn phản hồi giả lập
        const responseMessages = [
            'Cảm ơn bạn đã liên hệ với chúng tôi!',
            'Vâng, chúng tôi có thể giúp gì cho bạn?',
            'Chúng tôi đang có chương trình khuyến mãi 20% cho dịch vụ giặt ủi.',
            'Đơn hàng của bạn sẽ được giao trong 2 giờ tới.',
            'Bạn có thể cung cấp thêm thông tin chi tiết được không?'
        ];
        
        const newMessage = {
            id: Date.now(),
            sender: this.chatData.isShopOwner ? 'customer' : 'shop',
            senderName: this.chatData.isShopOwner ? 'Khách hàng' : 'Chủ cửa hàng',
            content: responseMessages[Math.floor(Math.random() * responseMessages.length)],
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        this.chatData.conversations[conversationId].push(newMessage);
        this.chatData.unreadCount++;
        
        // Cập nhật giao diện
        this.updateChatInterface();
        
        // Hiển thị thông báo
        this.showNotification(newMessage.senderName, newMessage.content);
    },

    // Hiển thị thông báo
    showNotification(sender, message) {
        // Kiểm tra xem thông báo có được hỗ trợ không
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(`Tin nhắn mới từ ${sender}`, {
                    body: message,
                    icon: '/images/chat-icon.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(`Tin nhắn mới từ ${sender}`, {
                            body: message,
                            icon: '/images/chat-icon.png'
                        });
                    }
                });
            }
        }
    },

    // Cập nhật giao diện chat
    updateChatInterface() {
        // Cập nhật số tin nhắn chưa đọc
        this.updateUnreadBadge();
        
        // Cập nhật danh sách tin nhắn
        this.updateMessageList();
    },

    // Cập nhật badge hiển thị số tin nhắn chưa đọc
    updateUnreadBadge() {
        const unreadBadge = document.querySelector('.chat-unread-badge');
        if (unreadBadge) {
            if (this.chatData.unreadCount > 0) {
                unreadBadge.textContent = this.chatData.unreadCount;
                unreadBadge.classList.remove('hidden');
            } else {
                unreadBadge.classList.add('hidden');
            }
        }
    },

    // Cập nhật danh sách tin nhắn
    updateMessageList() {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const conversationId = this.chatData.activeConversation;
        if (!conversationId || !this.chatData.conversations[conversationId]) {
            chatMessages.innerHTML = '<div class="text-center py-4 text-gray-500">Chưa có tin nhắn</div>';
            return;
        }
        
        const messages = this.chatData.conversations[conversationId];
        
        chatMessages.innerHTML = messages.map(msg => `
            <div class="message ${msg.sender === (this.chatData.isShopOwner ? 'shop' : 'customer') ? 'sent' : 'received'}">
                <div class="message-bubble">
                    <div class="message-content">${msg.content}</div>
                    <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                </div>
            </div>
        `).join('');
        
        // Cuộn xuống tin nhắn mới nhất
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Đánh dấu đã đọc
        this.markConversationAsRead(conversationId);
    },

    // Định dạng thời gian
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // Đánh dấu cuộc trò chuyện đã đọc
    markConversationAsRead(conversationId) {
        if (this.chatData.conversations[conversationId]) {
            const unreadMessages = [];
            
            this.chatData.conversations[conversationId].forEach(msg => {
                if (msg.sender !== (this.chatData.isShopOwner ? 'shop' : 'customer') && !msg.isRead) {
                    msg.isRead = true;
                    this.chatData.unreadCount = Math.max(0, this.chatData.unreadCount - 1);
                    unreadMessages.push(msg.id);
                }
            });
            
            // Báo cho server biết tin nhắn đã được đọc
            if (unreadMessages.length > 0 && this.chatData.websocket && this.chatData.websocket.readyState === WebSocket.OPEN) {
                this.chatData.websocket.send(JSON.stringify({
                    type: 'MARK_READ',
                    conversationId: conversationId,
                    messageIds: unreadMessages,
                    userId: this.chatData.currentUser?.userId || 'anonymous',
                    userType: this.chatData.isShopOwner ? 'shop' : 'customer'
                }));
            }
            
            this.updateUnreadBadge();
        }
    },

    // Gửi tin nhắn
    sendMessage(content) {
        // Nếu phương thức được gọi từ eventListener (không có tham số)
        if (content === undefined) {
            const messageInput = document.querySelector('.chat-input');
            if (!messageInput) {
                console.error('Không tìm thấy phần tử input với class .chat-input');
                return false;
            }
            content = messageInput.value.trim();
            
            if (!content) {
                console.log('Tin nhắn trống, không gửi');
                return false;
            }
        } else if (!content.trim()) {
            // Nếu phương thức được gọi với tham số content rỗng
            console.log('Tin nhắn trống, không gửi');
            return false;
        }
        
        console.log('Gửi tin nhắn:', content);
        
        const conversationId = this.chatData.activeConversation || 'default';
        const userId = this.chatData.currentUser?.userId || 'anonymous';
        const userType = this.chatData.isShopOwner ? 'shop' : 'customer';
        const userName = this.chatData.currentUser?.fullName || (userType === 'shop' ? 'Chủ cửa hàng' : 'Khách hàng');
        
        // Tạo đối tượng tin nhắn
        const newMessage = {
            id: Date.now(),
            sender: userType,
            senderId: userId,
            senderName: userName,
            content: content,
            targetId: conversationId, // ID của người nhận (customer hoặc shop)
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        // Thêm tin nhắn vào cuộc trò chuyện
        if (!this.chatData.conversations[conversationId]) {
            this.chatData.conversations[conversationId] = [];
        }
        
        this.chatData.conversations[conversationId].push({
            id: newMessage.id,
            sender: userType,
            senderName: 'Bạn',
            content: content,
            timestamp: newMessage.timestamp,
            isRead: false
        });
        
        // Xóa nội dung input nếu phương thức được gọi không có tham số
        if (content === undefined) {
            const messageInput = document.querySelector('.chat-input');
            if (messageInput) {
                messageInput.value = '';
            }
        }
        
        // Cập nhật giao diện
        this.updateChatInterface();
        
        // Gửi tin nhắn qua WebSocket nếu có kết nối
        if (this.chatData.websocket && this.chatData.websocket.readyState === 1) {
            try {
                if (typeof this.chatData.websocket.send === 'function') {
                    // Nếu là STOMP client
                    if (this.chatData.websocket.send.length === 3) {
                        this.chatData.websocket.send("/app/chat.send", {}, JSON.stringify(newMessage));
                    } else {
                        // Nếu là WebSocket tiêu chuẩn
                        this.chatData.websocket.send(JSON.stringify({
                            type: 'CHAT',
                            id: newMessage.id,
                            sender: userType,
                            senderName: this.chatData.currentUser?.fullName || 'Người dùng',
                            content: content,
                            timestamp: newMessage.timestamp,
                            conversationId: conversationId,
                            targetType: this.chatData.isShopOwner ? 'customer' : 'shop',
                            targetId: this.chatData.isShopOwner ? conversationId : 'shop1'
                        }));
                    }
                }
            } catch (error) {
                console.error('Lỗi khi gửi tin nhắn qua WebSocket:', error);
                // Fallback về chế độ giả lập
                setTimeout(() => this.simulateNewMessage(), 1000 + Math.random() * 2000);
            }
        } else {
            console.log('WebSocket không kết nối, sử dụng chế độ giả lập');
            // Giả lập phản hồi nếu không có kết nối WebSocket
            setTimeout(() => this.simulateNewMessage(), 1000 + Math.random() * 2000);
        }
        
        return true;
    },

    // Thiết lập các event listeners
    setupEventListeners() {
        console.log('Thiết lập chat event listeners');
        
        const setupEvents = () => {
            // Xử lý form gửi tin nhắn
            const chatForm = document.querySelector('.chat-form');
            if (chatForm) {
                console.log('Tìm thấy chat form');
                chatForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log('Form chat đã được submit');
                    this.sendMessage(); // Gọi không có tham số để lấy giá trị từ input
                });
            } else {
                console.log('Không tìm thấy chat form');
            }
            
            // Xử lý nút gửi tin nhắn
            const sendButton = document.querySelector('.chat-send-button');
            if (sendButton) {
                console.log('Tìm thấy nút gửi');
                sendButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Nút gửi đã được click');
                    this.sendMessage(); // Gọi không có tham số để lấy giá trị từ input
                });
            } else {
                console.log('Không tìm thấy nút gửi');
            }
            
            // Xử lý nút mở/đóng chat
            const toggleChatButton = document.querySelector('.toggle-chat-button');
            if (toggleChatButton) {
                console.log('Toggle chat button found');
                toggleChatButton.addEventListener('click', () => {
                    console.log('Toggle chat button clicked');
                    const chatContainer = document.querySelector('.chat-container');
                    if (chatContainer) {
                        // Sử dụng display style trực tiếp thay vì toggle class
                        if (chatContainer.style.display === 'none' || !chatContainer.style.display || chatContainer.style.display === '') {
                            chatContainer.style.display = 'flex';
                            console.log('Chat container opened with style.display=flex');
                        } else {
                            chatContainer.style.display = 'none';
                            console.log('Chat container closed with style.display=none');
                        }
                        
                        // Vẫn giữ lại class toggle cho tương thích
                        chatContainer.classList.toggle('chat-open');
                        console.log('Chat container toggled class:', chatContainer.classList.contains('chat-open'));
                        
                        if (chatContainer.style.display === 'flex' || chatContainer.classList.contains('chat-open')) {
                            this.updateMessageList();
                        }
                    } else {
                        console.log('Chat container not found');
                    }
                });
            } else {
                console.log('Toggle chat button not found');
            }
            
            // Xử lý nút đóng chat
            const closeChatButton = document.querySelector('.chat-close-button');
            if (closeChatButton) {
                console.log('Close button found');
                closeChatButton.addEventListener('click', () => {
                    console.log('Close button clicked');
                    const chatContainer = document.querySelector('.chat-container');
                    if (chatContainer) {
                        // Đóng chat bằng cách set display style
                        chatContainer.style.display = 'none';
                        console.log('Chat container closed with style.display=none');
                        
                        // Vẫn giữ lại class remove cho tương thích
                        chatContainer.classList.remove('chat-open');
                    }
                });
            } else {
                console.log('Close button not found');
            }
        };

        // Gọi hàm thiết lập sự kiện nếu DOM đã tải xong
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEvents);
        } else {
            // DOM đã được tải xong, gọi hàm ngay lập tức
            setupEvents();
        }
    },

    // Xử lý tin nhắn nhận được từ WebSocket
    handleReceivedMessage(message) {
        const conversationId = message.senderId;
        
        // Tạo cuộc trò chuyện mới nếu chưa tồn tại
        if (!this.chatData.conversations[conversationId]) {
            this.chatData.conversations[conversationId] = [];
        }
        
        // Thêm tin nhắn vào cuộc trò chuyện
        this.chatData.conversations[conversationId].push({
            id: message.id || Date.now(),
            sender: message.sender,
            senderName: message.senderName,
            content: message.content,
            timestamp: message.timestamp || new Date().toISOString(),
            isRead: false
        });
        
        // Cập nhật số tin nhắn chưa đọc
        if (this.chatData.activeConversation !== conversationId) {
            this.chatData.unreadCount++;
        } else {
            // Đánh dấu là đã đọc nếu đang trong cuộc trò chuyện này
            this.markConversationAsRead(conversationId);
        }
        
        // Cập nhật giao diện
        this.updateChatInterface();
        
        // Hiển thị thông báo
        this.showNotification(message.senderName, message.content);
    },

    // Xử lý thông báo đã đọc
    handleReadReceipt(readReceipt) {
        const conversationId = readReceipt.senderId;
        
        if (this.chatData.conversations[conversationId]) {
            // Đánh dấu tất cả tin nhắn là đã đọc
            this.chatData.conversations[conversationId].forEach(message => {
                if (message.sender === (this.chatData.isShopOwner ? 'shop' : 'customer')) {
                    message.isRead = true;
                }
            });
            
            // Cập nhật giao diện
            this.updateChatInterface();
        }
    },

    // Gửi trạng thái người dùng (online/offline)
    sendUserStatus(status) {
        if (!this.chatData.websocket) return;
        
        const userId = this.chatData.currentUser?.userId || 'anonymous';
        const userType = this.chatData.isShopOwner ? 'shop' : 'customer';
        
        try {
            this.chatData.websocket.send("/app/chat.status", {}, 
                JSON.stringify({
                    senderId: userId,
                    sender: userType,
                    status: status,
                    timestamp: new Date()
                })
            );
        } catch (error) {
            console.error('Error sending status update:', error);
        }
    },

    // Đánh dấu cuộc trò chuyện là đã đọc
    markConversationAsRead(conversationId) {
        if (!this.chatData.conversations[conversationId]) return;
        
        let hasUnread = false;
        
        // Đánh dấu tất cả tin nhắn là đã đọc
        this.chatData.conversations[conversationId].forEach(message => {
            if (!message.isRead && message.sender !== (this.chatData.isShopOwner ? 'shop' : 'customer')) {
                message.isRead = true;
                hasUnread = true;
            }
        });
        
        // Cập nhật số tin nhắn chưa đọc
        if (hasUnread) {
            this.chatData.unreadCount = Math.max(0, this.chatData.unreadCount - 1);
            
            // Cập nhật giao diện
            this.updateChatInterface();
            
            // Gửi thông báo đã đọc qua WebSocket
            if (this.chatData.websocket) {
                const userId = this.chatData.currentUser?.userId || 'anonymous';
                const userType = this.chatData.isShopOwner ? 'shop' : 'customer';
                
                try {
                    this.chatData.websocket.send("/app/chat.read", {}, 
                        JSON.stringify({
                            senderId: userId,
                            sender: userType,
                            targetId: conversationId,
                            timestamp: new Date().toISOString()
                        })
                    );
                } catch (error) {
                    console.error('Error sending read receipt:', error);
                }
            }
        }
    }
};

// Khởi tạo lại chatManager
document.addEventListener('DOMContentLoaded', () => {
    const isShopOwner = document.querySelector('body').classList.contains('shop-owner') || 
                         window.location.pathname.includes('/shopOwner');
    
    chatManager.init(isShopOwner);
});