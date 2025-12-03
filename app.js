// Demo Application Controller - Generates curl commands without calling APIs
class DemoApp {
    constructor() {
        this.imageHandler = new ImageHandler();
        this.areaSelector = null;
        this.currentAreaBounds = null;

        // Demo data storage
        this.richMenus = []; // Array of { id, name, chatBarText, size, areas, imageFileName, imageBase64 }
        this.aliases = []; // Array of { richMenuAliasId, richMenuId }

        // Counter for generating demo IDs
        this.richMenuCounter = 1;

        this.initializeElements();
        this.setupEventListeners();
        this.updateRichMenuList();
        this.updateAliasList();

        // Make app globally available for area selector callback
        window.app = this;
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Navigation
        this.navListBtn = document.getElementById('nav-list');
        this.navAliasBtn = document.getElementById('nav-alias');
        this.generateCurlBtn = document.getElementById('generate-curl-btn');

        // Pages
        this.listPage = document.getElementById('list-page');
        this.createPage = document.getElementById('create-page');
        this.aliasPage = document.getElementById('alias-page');

        // List page elements
        this.createRichMenuBtn = document.getElementById('create-richmenu-btn');
        this.richMenuList = document.getElementById('rich-menu-list');

        // Create page elements
        this.createForm = document.getElementById('create-form');
        this.imageUpload = document.getElementById('image-upload');
        this.imageValidation = document.getElementById('image-validation');
        this.previewSection = document.getElementById('preview-section');
        this.previewCanvas = document.getElementById('preview-canvas');
        this.imageInfo = document.getElementById('image-info');
        this.areasSection = document.getElementById('areas-section');
        this.areasList = document.getElementById('areas-list');
        this.menuName = document.getElementById('menu-name');
        this.nameCount = document.getElementById('name-count');
        this.chatBarText = document.getElementById('chat-bar-text');
        this.chatCount = document.getElementById('chat-count');
        this.cancelCreateBtn = document.getElementById('cancel-create');
        this.submitCreateBtn = document.getElementById('submit-create');
        this.createError = document.getElementById('create-error');
        this.createSuccess = document.getElementById('create-success');

        // Modal elements
        this.areaModal = document.getElementById('area-modal');
        this.areaActionTypeRadios = document.querySelectorAll('input[name="area-action-type"]');
        this.messageActionFields = document.getElementById('message-action-fields');
        this.richmenuswitchActionFields = document.getElementById('richmenuswitch-action-fields');
        this.uriActionFields = document.getElementById('uri-action-fields');
        this.actionText = document.getElementById('action-text');
        this.actionAliasId = document.getElementById('action-alias-id');
        this.actionUri = document.getElementById('action-uri');
        this.cancelAreaBtn = document.getElementById('cancel-area');
        this.saveAreaBtn = document.getElementById('save-area');

        // Alias page elements
        this.createAliasBtn = document.getElementById('create-alias-btn');
        this.aliasList = document.getElementById('alias-list');

        // Alias modal elements
        this.aliasModal = document.getElementById('alias-modal');
        this.aliasModalTitle = document.getElementById('alias-modal-title');
        this.aliasModalForm = document.getElementById('alias-modal-form');
        this.modalAliasId = document.getElementById('modal-alias-id');
        this.modalRichMenuSelect = document.getElementById('modal-richmenu-select');
        this.aliasModalError = document.getElementById('alias-modal-error');
        this.cancelAliasModalBtn = document.getElementById('cancel-alias-modal');
        this.saveAliasModalBtn = document.getElementById('save-alias-modal');

        // Curl modal elements
        this.curlModal = document.getElementById('curl-modal');
        this.curlCommandsContainer = document.getElementById('curl-commands-container');
        this.closeCurlModalBtn = document.getElementById('close-curl-modal');
        this.copyAllCurlBtn = document.getElementById('copy-all-curl');

        // Store current alias being edited
        this.currentEditingAlias = null;

        // Initialize area selector
        this.areaSelector = new AreaSelector(this.previewCanvas);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        this.navListBtn.addEventListener('click', () => this.showPage('list'));
        this.navAliasBtn.addEventListener('click', () => this.showPage('alias'));
        this.generateCurlBtn.addEventListener('click', () => this.showCurlModal());

        // List page
        this.createRichMenuBtn.addEventListener('click', () => this.showPage('create'));

        // Create page
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        this.menuName.addEventListener('input', (e) => this.updateCharCount(e.target, this.nameCount));
        this.chatBarText.addEventListener('input', (e) => this.updateCharCount(e.target, this.chatCount));
        this.cancelCreateBtn.addEventListener('click', () => {
            this.resetCreateForm();
            this.showPage('list');
        });
        this.createForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Alias page
        this.createAliasBtn.addEventListener('click', () => this.showCreateAliasModal());
        this.cancelAliasModalBtn.addEventListener('click', () => this.hideAliasModal());
        this.aliasModalForm.addEventListener('submit', (e) => this.handleAliasModalSubmit(e));

        // Area Modal
        this.areaActionTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleAreaActionTypeChange(e));
        });
        this.cancelAreaBtn.addEventListener('click', () => this.hideAreaModal());
        this.saveAreaBtn.addEventListener('click', () => this.saveArea());

        // Curl Modal
        this.closeCurlModalBtn.addEventListener('click', () => this.hideCurlModal());
        this.copyAllCurlBtn.addEventListener('click', () => this.copyAllCurlCommands());
    }

    /**
     * Show a specific page
     * @param {string} pageName - 'list', 'create', or 'alias'
     */
    showPage(pageName) {
        // Hide all pages
        this.listPage.classList.remove('active');
        this.createPage.classList.remove('active');
        this.aliasPage.classList.remove('active');

        // Deactivate all nav buttons
        this.navListBtn.classList.remove('active');
        this.navAliasBtn.classList.remove('active');

        if (pageName === 'list') {
            this.listPage.classList.add('active');
            this.navListBtn.classList.add('active');
            this.updateRichMenuList();
        } else if (pageName === 'create') {
            this.createPage.classList.add('active');
            this.resetCreateForm();
        } else if (pageName === 'alias') {
            this.aliasPage.classList.add('active');
            this.navAliasBtn.classList.add('active');
            this.updateAliasList();
        }
    }

    /**
     * Update rich menu list display
     */
    updateRichMenuList() {
        this.richMenuList.innerHTML = '';

        if (this.richMenus.length === 0) {
            this.richMenuList.innerHTML = `
                <p class="demo-info">
                    這是 Demo 模式，不會實際呼叫 LINE API。<br>
                    您可以：<br>
                    1. 建立 Rich Menu 設定<br>
                    2. 設定子頁面 (Alias)<br>
                    3. 點擊「產生 Curl」按鈕來產生可執行的 curl 指令
                </p>
            `;
            return;
        }

        this.richMenus.forEach((menu, index) => {
            const menuItem = this.createRichMenuItem(menu, index);
            this.richMenuList.appendChild(menuItem);
        });
    }

    /**
     * Create a rich menu list item
     * @param {Object} menu
     * @param {number} index
     * @returns {HTMLElement}
     */
    createRichMenuItem(menu, index) {
        const div = document.createElement('div');
        div.className = 'rich-menu-item';

        div.innerHTML = `
            <div class="rich-menu-image">
                <img class="rich-menu-thumbnail" src="${menu.imageBase64}" alt="${menu.name}">
            </div>
            <div class="rich-menu-header">
                <h3>${menu.name}</h3>
                <span class="demo-badge">Demo #${index + 1}</span>
            </div>
            <div class="rich-menu-info">
                <div class="rich-menu-info-item">
                    <strong>尺寸</strong>
                    <span>${menu.size.width} x ${menu.size.height}</span>
                </div>
                <div class="rich-menu-info-item">
                    <strong>聊天列文字</strong>
                    <span>${menu.chatBarText}</span>
                </div>
                <div class="rich-menu-info-item">
                    <strong>區域數量</strong>
                    <span>${menu.areas.length}</span>
                </div>
                <div class="rich-menu-info-item">
                    <strong>圖片檔名</strong>
                    <span>${menu.imageFileName}</span>
                </div>
            </div>
            <div class="rich-menu-actions">
                <button class="btn-action btn-delete" data-index="${index}">刪除</button>
            </div>
        `;

        const deleteBtn = div.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => this.deleteRichMenu(index));

        return div;
    }

    /**
     * Delete a rich menu from demo list
     * @param {number} index
     */
    deleteRichMenu(index) {
        const menu = this.richMenus[index];
        if (!confirm(`確定要刪除 Rich Menu「${menu.name}」嗎？`)) {
            return;
        }

        // Also remove any aliases pointing to this menu
        this.aliases = this.aliases.filter(alias => alias.richMenuId !== menu.id);

        this.richMenus.splice(index, 1);
        this.updateRichMenuList();
    }

    /**
     * Handle image upload
     * @param {Event} e
     */
    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.imageValidation.innerHTML = '';
        this.previewSection.style.display = 'none';
        this.areasSection.style.display = 'none';

        const result = await this.imageHandler.validateImage(file);

        if (result.success) {
            this.imageValidation.className = 'validation-message success';
            this.imageValidation.textContent = result.message;

            // Show preview
            const image = this.imageHandler.getImage();
            this.areaSelector.setImage(image);
            this.previewSection.style.display = 'block';

            // Update image info
            this.imageInfo.innerHTML = `
                <strong>圖片資訊:</strong>
                寬度: ${result.dimensions.width}px |
                高度: ${result.dimensions.height}px |
                長寬比: ${result.dimensions.aspectRatio.toFixed(2)} |
                檔案大小: ${(file.size / 1024).toFixed(2)} KB
            `;
        } else {
            this.imageValidation.className = 'validation-message error';
            this.imageValidation.textContent = result.message;
            this.imageHandler.reset();
        }
    }

    /**
     * Update character count
     * @param {HTMLInputElement} input
     * @param {HTMLElement} countEl
     */
    updateCharCount(input, countEl) {
        countEl.textContent = input.value.length;
    }

    /**
     * Show area configuration modal
     * @param {Object} bounds - Area bounds
     */
    showAreaModal(bounds) {
        this.currentAreaBounds = bounds;

        // Reset form
        this.actionText.value = '';
        this.actionAliasId.value = '';
        this.actionUri.value = '';

        // Reset to message type
        document.querySelector('input[name="area-action-type"][value="message"]').checked = true;
        this.messageActionFields.style.display = 'block';
        this.richmenuswitchActionFields.style.display = 'none';
        this.uriActionFields.style.display = 'none';

        this.areaModal.classList.remove('hidden');
        this.actionText.focus();
    }

    /**
     * Hide area configuration modal
     */
    hideAreaModal() {
        this.areaModal.classList.add('hidden');
        this.currentAreaBounds = null;
    }

    /**
     * Handle area action type change
     * @param {Event} e
     */
    handleAreaActionTypeChange(e) {
        const actionType = e.target.value;

        if (actionType === 'message') {
            this.messageActionFields.style.display = 'block';
            this.richmenuswitchActionFields.style.display = 'none';
            this.uriActionFields.style.display = 'none';
        } else if (actionType === 'richmenuswitch') {
            this.messageActionFields.style.display = 'none';
            this.richmenuswitchActionFields.style.display = 'block';
            this.uriActionFields.style.display = 'none';
        } else if (actionType === 'uri') {
            this.messageActionFields.style.display = 'none';
            this.richmenuswitchActionFields.style.display = 'none';
            this.uriActionFields.style.display = 'block';
        }
    }

    /**
     * Validate URI format
     * @param {string} uri - The URI to validate
     * @returns {boolean} - True if valid
     */
    validateUri(uri) {
        const validPrefixes = ['http://', 'https://', 'tel:'];
        return validPrefixes.some(prefix => uri.startsWith(prefix));
    }

    /**
     * Save configured area
     */
    saveArea() {
        const actionType = document.querySelector('input[name="area-action-type"]:checked').value;
        let action;

        if (actionType === 'message') {
            const text = this.actionText.value.trim();

            if (!text) {
                alert('請填寫訊息文字！');
                return;
            }

            action = {
                type: 'message',
                text: text
            };
        } else if (actionType === 'richmenuswitch') {
            const aliasId = this.actionAliasId.value.trim();
            if (!aliasId) {
                alert('請輸入別名 ID！');
                return;
            }

            action = {
                type: 'richmenuswitch',
                richMenuAliasId: aliasId,
                data: aliasId
            };
        } else if (actionType === 'uri') {
            const uri = this.actionUri.value.trim();

            if (!uri) {
                alert('請填寫網址 (URI)！');
                return;
            }

            if (!this.validateUri(uri)) {
                alert('網址格式不正確！必須以 http://, https://, 或 tel: 開頭');
                return;
            }

            action = {
                type: 'uri',
                uri: uri
            };
        }

        this.areaSelector.addArea(this.currentAreaBounds, action);
        this.hideAreaModal();
        this.updateAreasList();
    }

    /**
     * Update areas list display
     */
    updateAreasList() {
        const areas = this.areaSelector.getAreas();

        if (areas.length === 0) {
            this.areasSection.style.display = 'none';
            return;
        }

        this.areasSection.style.display = 'block';
        this.areasList.innerHTML = '';

        areas.forEach((area, index) => {
            const areaItem = document.createElement('div');
            areaItem.className = 'area-item';

            // Build action info based on type
            let actionInfo = '';
            if (area.action.type === 'message') {
                actionInfo = `<p>類型: 訊息</p>
                    <p>文字: ${area.action.text}</p>`;
            } else if (area.action.type === 'richmenuswitch') {
                actionInfo = `<p>類型: 切換子頁面</p>
                    <p>別名: ${area.action.richMenuAliasId}</p>`;
            } else if (area.action.type === 'uri') {
                actionInfo = `<p>類型: 開啟網址</p>
                    <p>網址: ${area.action.uri}</p>`;
            }

            areaItem.innerHTML = `
                <div class="area-info">
                    <h4>區域 ${index + 1}</h4>
                    <p>位置: (${area.bounds.x}, ${area.bounds.y})</p>
                    <p>尺寸: ${area.bounds.width} x ${area.bounds.height}</p>
                    ${actionInfo}
                </div>
                <div class="area-actions">
                    <button type="button" class="btn-small btn-delete" data-index="${index}">刪除</button>
                </div>
            `;

            const deleteBtn = areaItem.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => this.deleteArea(index));

            this.areasList.appendChild(areaItem);
        });
    }

    /**
     * Delete an area
     * @param {number} index
     */
    deleteArea(index) {
        if (confirm('確定要刪除此區域嗎？')) {
            this.areaSelector.removeArea(index);
            this.updateAreasList();
        }
    }

    /**
     * Reset create form
     */
    resetCreateForm() {
        this.createForm.reset();
        this.imageHandler.reset();
        this.areaSelector.reset();
        this.imageValidation.innerHTML = '';
        this.previewSection.style.display = 'none';
        this.areasSection.style.display = 'none';
        this.imageInfo.innerHTML = '';
        this.nameCount.textContent = '0';
        this.chatCount.textContent = '0';
        this.createError.classList.add('hidden');
        this.createSuccess.classList.add('hidden');
    }

    /**
     * Handle form submission - add to demo list
     * @param {Event} e
     */
    async handleSubmit(e) {
        e.preventDefault();

        // Validate
        if (!this.imageHandler.getImage()) {
            alert('請上傳圖片！');
            return;
        }

        const areas = this.areaSelector.getAreasForAPI();
        if (areas.length === 0) {
            alert('請至少定義一個可點擊區域！');
            return;
        }

        const name = this.menuName.value.trim();
        const chatBarText = this.chatBarText.value.trim();

        if (!name || !chatBarText) {
            alert('請填寫所有必填欄位！');
            return;
        }

        // Get image data
        const image = this.imageHandler.getImage();
        const imageFile = this.imageHandler.getFile();

        // Create demo rich menu object
        const demoMenu = {
            id: `demo-richmenu-${this.richMenuCounter++}`,
            name: name,
            chatBarText: chatBarText,
            size: {
                width: image.naturalWidth,
                height: image.naturalHeight
            },
            selected: false,
            areas: areas,
            imageFileName: imageFile.name,
            imageBase64: image.src,
            imageType: imageFile.type
        };

        this.richMenus.push(demoMenu);

        this.createSuccess.textContent = `Rich Menu「${name}」已新增到列表！`;
        this.createSuccess.classList.remove('hidden');

        setTimeout(() => {
            this.resetCreateForm();
            this.showPage('list');
        }, 1500);
    }

    /**
     * Update alias list display
     */
    updateAliasList() {
        this.aliasList.innerHTML = '';

        if (this.aliases.length === 0) {
            this.aliasList.innerHTML = '<p class="demo-info">尚未設定任何子頁面別名</p>';
            return;
        }

        this.aliases.forEach((alias, index) => {
            const aliasItem = this.createAliasItem(alias, index);
            this.aliasList.appendChild(aliasItem);
        });
    }

    /**
     * Create an alias list item
     * @param {Object} alias
     * @param {number} index
     * @returns {HTMLElement}
     */
    createAliasItem(alias, index) {
        const div = document.createElement('div');
        div.className = 'alias-item';

        // Find the associated rich menu
        const richMenu = this.richMenus.find(m => m.id === alias.richMenuId);
        const richMenuName = richMenu ? richMenu.name : '(已刪除)';

        div.innerHTML = `
            <div class="rich-menu-image">
                ${richMenu ? `<img class="rich-menu-thumbnail" src="${richMenu.imageBase64}" alt="${richMenuName}">` : '<div class="image-error"><span>圖片已刪除</span></div>'}
            </div>
            <div class="alias-info">
                <h3>${alias.richMenuAliasId}</h3>
                <div class="alias-details">
                    <div class="alias-detail-item">
                        <strong>Rich Menu</strong>
                        <span>${richMenuName}</span>
                    </div>
                </div>
            </div>
            <div class="alias-actions">
                <button class="btn-action btn-edit" data-index="${index}">編輯</button>
                <button class="btn-action btn-delete" data-index="${index}">刪除</button>
            </div>
        `;

        const editBtn = div.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => this.showEditAliasModal(alias, index));

        const deleteBtn = div.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => this.deleteAlias(index));

        return div;
    }

    /**
     * Show create alias modal
     */
    showCreateAliasModal() {
        if (this.richMenus.length === 0) {
            alert('請先建立至少一個 Rich Menu！');
            return;
        }

        this.currentEditingAlias = null;
        this.aliasModalTitle.textContent = '建立子頁面';
        this.modalAliasId.value = '';
        this.modalAliasId.disabled = false;
        this.aliasModalError.classList.add('hidden');

        this.populateModalRichMenuSelect();

        this.aliasModal.classList.remove('hidden');
        this.modalAliasId.focus();
    }

    /**
     * Show edit alias modal
     * @param {Object} alias
     * @param {number} index
     */
    showEditAliasModal(alias, index) {
        this.currentEditingAlias = { ...alias, index };
        this.aliasModalTitle.textContent = '編輯子頁面';
        this.modalAliasId.value = alias.richMenuAliasId;
        this.modalAliasId.disabled = true;
        this.aliasModalError.classList.add('hidden');

        this.populateModalRichMenuSelect();
        this.modalRichMenuSelect.value = alias.richMenuId;

        this.aliasModal.classList.remove('hidden');
        this.modalRichMenuSelect.focus();
    }

    /**
     * Hide alias modal
     */
    hideAliasModal() {
        this.aliasModal.classList.add('hidden');
        this.aliasModalForm.reset();
        this.currentEditingAlias = null;
        this.aliasModalError.classList.add('hidden');
    }

    /**
     * Populate modal rich menu select
     */
    populateModalRichMenuSelect() {
        this.modalRichMenuSelect.innerHTML = '<option value="">-- 請選擇 Rich Menu --</option>';

        this.richMenus.forEach(menu => {
            const option = document.createElement('option');
            option.value = menu.id;
            option.textContent = menu.name;
            this.modalRichMenuSelect.appendChild(option);
        });
    }

    /**
     * Handle alias modal form submission
     * @param {Event} e
     */
    handleAliasModalSubmit(e) {
        e.preventDefault();

        const aliasId = this.modalAliasId.value.trim();
        const richMenuId = this.modalRichMenuSelect.value;

        if (!aliasId || !richMenuId) {
            alert('請填寫所有欄位！');
            return;
        }

        // Check for duplicate alias ID (only for new aliases)
        if (!this.currentEditingAlias) {
            const exists = this.aliases.some(a => a.richMenuAliasId === aliasId);
            if (exists) {
                this.aliasModalError.textContent = '此別名 ID 已存在！';
                this.aliasModalError.classList.remove('hidden');
                return;
            }
        }

        if (this.currentEditingAlias) {
            // Update existing alias
            this.aliases[this.currentEditingAlias.index] = {
                richMenuAliasId: aliasId,
                richMenuId: richMenuId
            };
        } else {
            // Create new alias
            this.aliases.push({
                richMenuAliasId: aliasId,
                richMenuId: richMenuId
            });
        }

        this.hideAliasModal();
        this.updateAliasList();
    }

    /**
     * Delete an alias
     * @param {number} index
     */
    deleteAlias(index) {
        const alias = this.aliases[index];
        if (!confirm(`確定要刪除別名「${alias.richMenuAliasId}」嗎？`)) {
            return;
        }

        this.aliases.splice(index, 1);
        this.updateAliasList();
    }

    /**
     * Show curl commands modal
     */
    showCurlModal() {
        if (this.richMenus.length === 0 && this.aliases.length === 0) {
            alert('請先建立至少一個 Rich Menu 或子頁面別名！');
            return;
        }

        const commands = this.generateAllCurlCommands();
        this.displayCurlCommands(commands);
        this.curlModal.classList.remove('hidden');
    }

    /**
     * Hide curl modal
     */
    hideCurlModal() {
        this.curlModal.classList.add('hidden');
    }

    /**
     * Generate all curl commands
     * @returns {Array} Array of { step, description, command }
     */
    generateAllCurlCommands() {
        const commands = [];
        let step = 1;

        // 1. Create Rich Menus
        this.richMenus.forEach((menu, index) => {
            // Create Rich Menu command
            const richMenuData = {
                size: menu.size,
                selected: menu.selected,
                name: menu.name,
                chatBarText: menu.chatBarText,
                areas: menu.areas
            };

            commands.push({
                step: step++,
                description: `建立 Rich Menu「${menu.name}」`,
                note: '請記下回傳的 richMenuId，後續步驟會用到',
                command: this.generateCreateRichMenuCurl(richMenuData)
            });

            // Upload image command
            commands.push({
                step: step++,
                description: `上傳圖片到 Rich Menu「${menu.name}」`,
                note: `請將 {richMenuId_${index + 1}} 替換為上一步回傳的 richMenuId`,
                command: this.generateUploadImageCurl(index + 1, menu.imageFileName, menu.imageType)
            });
        });

        // 2. Create Aliases
        this.aliases.forEach((alias) => {
            // Find which demo rich menu this alias points to
            const menuIndex = this.richMenus.findIndex(m => m.id === alias.richMenuId);
            const richMenuPlaceholder = menuIndex >= 0 ? `{richMenuId_${menuIndex + 1}}` : '{richMenuId}';

            commands.push({
                step: step++,
                description: `建立子頁面別名「${alias.richMenuAliasId}」`,
                note: menuIndex >= 0 ? `請將 ${richMenuPlaceholder} 替換為對應的 richMenuId` : '',
                command: this.generateCreateAliasCurl(alias.richMenuAliasId, richMenuPlaceholder)
            });
        });

        // 3. Set default Rich Menu (if there's at least one)
        if (this.richMenus.length > 0) {
            commands.push({
                step: step++,
                description: '設定預設 Rich Menu (可選)',
                note: '將 {richMenuId_1} 替換為要設為預設的 richMenuId',
                command: this.generateSetDefaultCurl('{richMenuId_1}')
            });
        }

        return commands;
    }

    /**
     * Generate curl command for creating rich menu
     * @param {Object} richMenuData
     * @returns {string}
     */
    generateCreateRichMenuCurl(richMenuData) {
        const jsonData = JSON.stringify(richMenuData, null, 2);
        return `curl -v -X POST https://api.line.me/v2/bot/richmenu \\
  -H 'Authorization: Bearer {channel access token}' \\
  -H 'Content-Type: application/json' \\
  -d '${jsonData}'`;
    }

    /**
     * Generate curl command for uploading image
     * @param {number} menuNumber
     * @param {string} fileName
     * @param {string} contentType
     * @returns {string}
     */
    generateUploadImageCurl(menuNumber, fileName, contentType) {
        return `curl -v -X POST https://api-data.line.me/v2/bot/richmenu/{richMenuId_${menuNumber}}/content \\
  -H 'Authorization: Bearer {channel access token}' \\
  -H 'Content-Type: ${contentType}' \\
  -T ${fileName}`;
    }

    /**
     * Generate curl command for creating alias
     * @param {string} aliasId
     * @param {string} richMenuId
     * @returns {string}
     */
    generateCreateAliasCurl(aliasId, richMenuId) {
        return `curl -v -X POST https://api.line.me/v2/bot/richmenu/alias \\
  -H 'Authorization: Bearer {channel access token}' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "richMenuAliasId": "${aliasId}",
  "richMenuId": "${richMenuId}"
}'`;
    }

    /**
     * Generate curl command for setting default rich menu
     * @param {string} richMenuId
     * @returns {string}
     */
    generateSetDefaultCurl(richMenuId) {
        return `curl -v -X POST https://api.line.me/v2/bot/user/all/richmenu/${richMenuId} \\
  -H 'Authorization: Bearer {channel access token}'`;
    }

    /**
     * Generate curl command for deleting rich menu
     * @param {string} richMenuId
     * @returns {string}
     */
    generateDeleteRichMenuCurl(richMenuId) {
        return `curl -v -X DELETE https://api.line.me/v2/bot/richmenu/${richMenuId} \\
  -H 'Authorization: Bearer {channel access token}'`;
    }

    /**
     * Generate curl command for clearing default rich menu
     * @returns {string}
     */
    generateClearDefaultCurl() {
        return `curl -v -X DELETE https://api.line.me/v2/bot/user/all/richmenu \\
  -H 'Authorization: Bearer {channel access token}'`;
    }

    /**
     * Generate curl command for deleting alias
     * @param {string} aliasId
     * @returns {string}
     */
    generateDeleteAliasCurl(aliasId) {
        return `curl -v -X DELETE https://api.line.me/v2/bot/richmenu/alias/${aliasId} \\
  -H 'Authorization: Bearer {channel access token}'`;
    }

    /**
     * Display curl commands in the modal
     * @param {Array} commands
     */
    displayCurlCommands(commands) {
        this.curlCommandsContainer.innerHTML = '';

        if (commands.length === 0) {
            this.curlCommandsContainer.innerHTML = '<p class="demo-info">沒有可產生的指令</p>';
            return;
        }

        commands.forEach(cmd => {
            const cmdDiv = document.createElement('div');
            cmdDiv.className = 'curl-command-item';

            cmdDiv.innerHTML = `
                <div class="curl-command-header">
                    <span class="curl-step">步驟 ${cmd.step}</span>
                    <span class="curl-description">${cmd.description}</span>
                    <button class="btn-copy" data-command="${this.escapeHtml(cmd.command)}">複製</button>
                </div>
                ${cmd.note ? `<p class="curl-note">${cmd.note}</p>` : ''}
                <pre class="curl-code"><code>${this.escapeHtml(cmd.command)}</code></pre>
            `;

            const copyBtn = cmdDiv.querySelector('.btn-copy');
            copyBtn.addEventListener('click', () => this.copySingleCommand(cmd.command, copyBtn));

            this.curlCommandsContainer.appendChild(cmdDiv);
        });
    }

    /**
     * Copy a single curl command
     * @param {string} command
     * @param {HTMLElement} button
     */
    async copySingleCommand(command, button) {
        try {
            await navigator.clipboard.writeText(command);
            const originalText = button.textContent;
            button.textContent = '已複製！';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        } catch (err) {
            alert('複製失敗，請手動複製');
        }
    }

    /**
     * Copy all curl commands
     */
    async copyAllCurlCommands() {
        const commands = this.generateAllCurlCommands();
        const allCommands = commands.map(cmd =>
            `# 步驟 ${cmd.step}: ${cmd.description}\n${cmd.note ? `# ${cmd.note}\n` : ''}${cmd.command}`
        ).join('\n\n');

        try {
            await navigator.clipboard.writeText(allCommands);
            const originalText = this.copyAllCurlBtn.textContent;
            this.copyAllCurlBtn.textContent = '已複製全部！';
            this.copyAllCurlBtn.classList.add('copied');
            setTimeout(() => {
                this.copyAllCurlBtn.textContent = originalText;
                this.copyAllCurlBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            alert('複製失敗，請手動複製');
        }
    }

    /**
     * Escape HTML entities
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DemoApp();
});
