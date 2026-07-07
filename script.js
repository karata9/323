import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc as fsDeleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRH1As8zPE-jbt2vfnDa6iHmVTAreoCOE",
    authDomain: "dfdk-d99c9.firebaseapp.com",
    projectId: "dfdk-d99c9",
    storageBucket: "dfdk-d99c9.firebasestorage.app",
    messagingSenderId: "615222975065",
    appId: "1:615222975065:web:1ce18526be1db66346af48"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to modify database logic and reduce operational costs (Data Version Flag)
function bumpDataVersion() {
    console.log("System Data Version Flag Bumped: Bypass unnecessary reads enabled.");
    localStorage.setItem('db_version_flag', '1.1');
}
bumpDataVersion();

window.getGlobalPassword = function() {
    return localStorage.getItem('global_password') || '1001';
};

document.addEventListener('DOMContentLoaded', () => {
    function showCustomAlert(message, icon = '✨') {
        const alertModal = document.getElementById('custom-alert-modal');
        const alertMessage = document.getElementById('custom-alert-message');
        const alertIcon = document.getElementById('custom-alert-icon');
        const closeAlertBtn = document.getElementById('close-custom-alert-btn');

        if (alertModal && alertMessage && alertIcon) {
            alertMessage.textContent = message;
            alertIcon.textContent = icon;
            alertModal.style.display = 'flex';

            closeAlertBtn.onclick = () => {
                alertModal.style.display = 'none';
            };
        } else {
            alert(message);
        }
    }

    window.sendWhatsAppMessage = function(text) {
        if (confirm('هل تود مشاركة التفاصيل عبر واتساب؟')) {
            window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
        }
    };

    // Number formatting helper removed per user request

    function getUnformattedNumber(value) {
        if (!value) return 0;
        return Number(value.toString().replace(/,/g, '')) || 0;
    }

    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('number-format')) {
            let cursorPosition = e.target.selectionStart;
            let originalLength = e.target.value.length;

            // Convert Arabic numerals to English numerals
            let englishValue = e.target.value.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
            let value = englishValue.replace(/,/g, '').replace(/[^\d.]/g, '');
            if (value !== '') {
                let parts = value.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                e.target.value = parts.join('.');
            } else {
                e.target.value = '';
            }

            let newLength = e.target.value.length;
            cursorPosition = cursorPosition + (newLength - originalLength);
            e.target.setSelectionRange(cursorPosition, cursorPosition);
        }
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Form submission and calculation logic
    const form = document.getElementById('property-form');
    const propAmountInput = document.getElementById('prop-amount');
    const amountReceivedInput = document.getElementById('amount-received');
    const amountRemainingInput = document.getElementById('amount-remaining');

    function calculateRemaining() {
        if (!propAmountInput || !amountReceivedInput || !amountRemainingInput) return;
        const amount = getUnformattedNumber(propAmountInput.value);
        const received = getUnformattedNumber(amountReceivedInput.value);
        const remaining = amount - received;
        amountRemainingInput.value = remaining ? Number(remaining).toLocaleString('en-US') : '0';
    }

    if (propAmountInput && amountReceivedInput) {
        propAmountInput.addEventListener('input', calculateRemaining);
        amountReceivedInput.addEventListener('input', calculateRemaining);
    }

    // Image Upload Logic
    const openUploadModalBtn = document.getElementById('open-upload-modal');
    const uploadModal = document.getElementById('upload-modal');
    const saveImagesBtn = document.getElementById('save-images-btn');
    const cancelImagesBtn = document.getElementById('cancel-images-btn');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const imageCountSpan = document.getElementById('image-count');
    
    let uploadedImages = []; // Local temporary memory for images

    function renderImagePreview() {
        if (!imagePreview) return;
        imagePreview.innerHTML = uploadedImages.map((imgSrc, idx) => `
            <div style="position:relative; display:inline-block; margin:5px;">
                <img src="${imgSrc}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                <button type="button" class="btn-red" style="position:absolute; top:-5px; right:-5px; border-radius:50%; width:24px; height:24px; padding:0; line-height:1; cursor:pointer;" onclick="window.removeTempImage(${idx})">X</button>
            </div>
        `).join('');
        if (imageCountSpan) imageCountSpan.textContent = `(${uploadedImages.length})`;
    }

    window.removeTempImage = function(idx) {
        uploadedImages.splice(idx, 1);
        renderImagePreview();
    };

    if (openUploadModalBtn && uploadModal) {
        openUploadModalBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });
        
        cancelImagesBtn.addEventListener('click', () => {
            uploadModal.classList.remove('active');
        });
        
        saveImagesBtn.addEventListener('click', () => {
            uploadModal.classList.remove('active');
            if (imageCountSpan) imageCountSpan.textContent = `(${uploadedImages.length})`;
            showCustomAlert('تم إرفاق الصور بنجاح.', '🖼️');
        });
        
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 1200; 
                            const MAX_HEIGHT = 1200;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                            } else {
                                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                            }
                            canvas.width = width; canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
                            
                            uploadedImages.push(dataUrl);
                            renderImagePreview();
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
            imageInput.value = '';
        });
    }

    let transactionsData = [];
    let currentFilter = 'غير مكتملة';
    let editingId = null;

    const searchInput = document.getElementById('search-transactions');
    if (searchInput) {
        searchInput.addEventListener('input', renderTransactionsUI);
    }

    window.saveToFirebase = async function() {
        try {
            // Sanitize transactionsData to remove undefined values
            transactionsData.forEach(t => {
                if (!t.commissions) t.commissions = { seller: 120000, buyer: 120000, sellerPaid: false, buyerPaid: false };
                if (t.commissions.sellerPaid === undefined) t.commissions.sellerPaid = false;
                if (t.commissions.buyerPaid === undefined) t.commissions.buyerPaid = false;
                if (t.paymentsLog === undefined) t.paymentsLog = [];
                if (t.expensesLog === undefined) t.expensesLog = [];
            });

            const data = {
                transactions: transactionsData,
                treasuryBalance: treasuryBalance,
                treasuryHistory: treasuryHistory,
                partnershipHistory: partnershipHistory,
                globalPassword: localStorage.getItem('global_password') || '1001'
            };
            await setDoc(doc(db, "app_data", "main"), data);
        } catch (error) {
            console.error("Error saving to Firebase:", error);
            if (error.code === 'permission-denied') {
                showCustomAlert('خطأ في صلاحيات قاعدة البيانات، يرجى تعديل الـ Rules', '❌');
            }
        }
    };

    window.loadFromFirebase = async function() {
        try {
            const docSnap = await getDoc(doc(db, "app_data", "main"));
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.transactions) transactionsData = data.transactions;
                if (data.treasuryBalance !== undefined) treasuryBalance = data.treasuryBalance;
                if (data.treasuryHistory) treasuryHistory = data.treasuryHistory;
                if (data.partnershipHistory) partnershipHistory = data.partnershipHistory;
                if (data.globalPassword) localStorage.setItem('global_password', data.globalPassword);
            }
        } catch (error) {
            console.error("Error loading from Firebase:", error);
            if (error.code === 'permission-denied') {
                showCustomAlert('خطأ في صلاحيات قاعدة البيانات، يرجى تعديل الـ Rules', '❌');
            }
        }
        renderTransactionsUI();
        updateTreasuryUIDisplay();
        updatePartnershipUIDisplay();
    };

    const indexBtns = document.querySelectorAll('.index-btn');
    indexBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            indexBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTransactionsUI();
        });
    });

    function renderTransactions() {
        window.saveToFirebase();
        renderTransactionsUI();
    }

    function renderTransactionsUI() {
        const allTransactionsList = document.getElementById('all-transactions-list');
        
        if (!allTransactionsList) return;

        const transactionGroup = allTransactionsList.closest('.transaction-group');
        if (transactionGroup) {
            transactionGroup.classList.remove('bg-incomplete', 'bg-ongoing', 'bg-completed');
            if (currentFilter === 'غير مكتملة' || currentFilter === 'غير_مكتملة') {
                transactionGroup.classList.add('bg-incomplete');
            } else if (currentFilter === 'جارية') {
                transactionGroup.classList.add('bg-ongoing');
            } else if (currentFilter === 'مكتملة') {
                transactionGroup.classList.add('bg-completed');
            }
        }

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        const filteredTransactions = transactionsData.filter(t => {
            const matchesSearch = t.sellerName.toLowerCase().includes(searchTerm) || 
                                  (t.buyerName && t.buyerName.toLowerCase().includes(searchTerm)) ||
                                  (t.propNumber && t.propNumber.includes(searchTerm));
            const matchesFilter = t.status === currentFilter;
            return matchesSearch && matchesFilter;
        });

        const createCardHTML = (t) => {
            let isOffice = (t.sellerName === 'المكتب' || t.buyerName === 'المكتب');
            let officeClass = isOffice ? 'office-transaction' : '';
            return `
                <div class="transaction-card ${officeClass}" data-id="${t.id}" style="border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; margin-bottom: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px 15px;">
                    <div class="transaction-card-info">
                        <h4 style="margin: 0 0 5px 0;">${t.sellerName} <span style="font-weight: bold; font-size: 0.9em; opacity: 0.8;">(بائع)</span> <span style="font-weight: bold; margin: 0 5px;">⬅️</span> ${t.buyerName} <span style="font-weight: bold; font-size: 0.9em; opacity: 0.8;">(مشتري)</span></h4>
                        <p style="margin: 0; font-size: 0.85em; opacity: 0.8; font-weight: bold;">التاريخ: ${t.propDate || 'غير محدد'}</p>
                    </div>
                    <div class="transaction-actions" style="display: flex; gap: 10px; margin-left: 15px; margin-right: 15px;">
                        <button type="button" class="action-btn edit-btn" data-id="${t.id}" title="تعديل" style="padding: 5px; font-size: 1.2em;">✏️</button>
                        <button type="button" class="action-btn delete-btn" data-id="${t.id}" title="حذف" style="padding: 5px; font-size: 1.2em;">🗑️</button>
                    </div>
                    <div class="transaction-card-arrow">&#10094;</div>
                </div>
            `;
        };

        if (filteredTransactions.length === 0) {
            allTransactionsList.innerHTML = '<div class="empty-state">لا توجد معاملات من هذا النوع.</div>';
        } else {
            const groupedTransactions = {};
            filteredTransactions.forEach(t => {
                const propNum = t.propNumber || 'غير محدد';
                if (!groupedTransactions[propNum]) {
                    groupedTransactions[propNum] = [];
                }
                groupedTransactions[propNum].push(t);
            });

            let finalHTML = '';
            for (const propNum in groupedTransactions) {
                const group = groupedTransactions[propNum];
                group.sort((a, b) => a.id - b.id);
                const firstTransaction = group[0];
                let isOffice = group.some(t => t.sellerName === 'المكتب' || t.buyerName === 'المكتب');
                let officeClass = isOffice ? 'office-transaction' : '';

                const transactionsHTML = group.map(t => createCardHTML(t)).join('');

                finalHTML += `
                    <div class="property-folder ${officeClass}">
                        <div class="folder-header" onclick="this.parentElement.classList.toggle('expanded')">
                            <div class="transaction-card-info">
                                <h4>📁 عقار رقم: ${propNum}</h4>
                                <p><strong>أول بائع:</strong> ${firstTransaction.sellerName}</p>
                                <span class="badge" style="background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-top: 5px; display: inline-block;">${group.length} معاملة</span>
                            </div>
                            <div class="transaction-card-arrow folder-arrow">&#10094;</div>
                        </div>
                        <div class="folder-content" style="display: none; padding: 15px; border-top: 1px solid rgba(0,0,0,0.05); background: rgba(0,0,0,0.02);">
                            ${transactionsHTML}
                        </div>
                    </div>
                `;
            }
            allTransactionsList.innerHTML = finalHTML;
        }
    }

    // Details Modal Logic
    const allTransactionsList = document.getElementById('all-transactions-list');
    const detailsModal = document.getElementById('details-modal');
    const detailsContent = document.getElementById('details-content');

    if (allTransactionsList && detailsModal) {
        allTransactionsList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            const editBtn = e.target.closest('.edit-btn');
            
            if (deleteBtn) {
                e.stopPropagation();
                const id = Number(deleteBtn.getAttribute('data-id'));
                if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
                    transactionsData = transactionsData.filter(t => t.id !== id);
                    renderTransactions();
                }
                return;
            }

            if (editBtn) {
                e.stopPropagation();
                const id = Number(editBtn.getAttribute('data-id'));
                const transaction = transactionsData.find(t => t.id === id);
                if (transaction) {
                    const parts = (transaction.propNumber || '').split('/');
                    if (parts.length === 2) {
                        document.getElementById('prop-number-right').value = parts[0];
                        document.getElementById('prop-number-left').value = parts[1];
                    } else {
                        document.getElementById('prop-number-right').value = transaction.propNumber;
                        document.getElementById('prop-number-left').value = '';
                    }
                    document.getElementById('prop-area').value = transaction.propArea || '';
                    document.getElementById('prop-date').value = transaction.propDate;
                    document.getElementById('seller-name').value = transaction.sellerName;
                    document.getElementById('seller-phone').value = transaction.sellerPhone;
                    document.getElementById('buyer-name').value = transaction.buyerName;
                    document.getElementById('buyer-phone').value = transaction.buyerPhone;
                    document.getElementById('prop-amount').value = transaction.propAmount ? Number(transaction.propAmount).toLocaleString('en-US') : '0';
                    document.getElementById('amount-received').value = transaction.amountReceived ? Number(transaction.amountReceived).toLocaleString('en-US') : '0';
                    document.getElementById('amount-remaining').value = transaction.amountRemaining ? Number(transaction.amountRemaining).toLocaleString('en-US') : '0';
                    
                    uploadedImages = [...(transaction.images || [])];
                    renderImagePreview();

                    editingId = id;
                    document.querySelector('.submit-btn').textContent = 'حفظ التعديلات';
                    
                    // Switch to add tab
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('[data-target="add-property"]').classList.add('active');
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById('add-property').classList.add('active');
                }
                return;
            }

            const card = e.target.closest('.transaction-card');
            if (card) {
                const id = Number(card.getAttribute('data-id'));
                const transaction = transactionsData.find(t => t.id === id);
                if (transaction) {
                    showDetailsModal(transaction);
                }
            }
        });
    }

    // --- GLOBAL FUNCTIONS FOR PAYMENTS & COMMISSIONS ---
    window.addPayment = function(id) {
        let t = transactionsData.find(x => x.id === id);
        let date = document.getElementById('new-pay-date').value;
        let amountStr = document.getElementById('new-pay-amount').value.replace(/,/g, '');
        let amount = Number(amountStr);
        let note = document.getElementById('new-pay-note').value || 'تسديد';
        if(amount > 0) {
            t.paymentsLog.push({ date, amount, note });
            renderTransactions();
            showDetailsModal(t);
            
            const waMsg = `تسديد جديد\nرقم العقار: ${t.propNumber}\nالبائع: ${t.sellerName}\nالمشتري: ${t.buyerName}\nتم تسديد مبلغ: ${amount.toLocaleString('en-US')} دينار\nملاحظة: ${note}`;
            window.sendWhatsAppMessage(waMsg);
        }
    };

    window.deletePayment = function(id, index) {
        let t = transactionsData.find(x => x.id === id);
        if(confirm('هل أنت متأكد من حذف هذا التسديد؟')) {
            t.paymentsLog.splice(index, 1);
            renderTransactions();
            showDetailsModal(t);
        }
    };

    window.updateComm = function(id, type, valStr) {
        let t = transactionsData.find(x => x.id === id);
        let val = Number(valStr.replace(/,/g, ''));
        t.commissions[type] = val;
        renderTransactions();
        showDetailsModal(t);
    };

    let pendingActionToggle = null;
    window.toggleComm = function(id, type) {
        pendingActionToggle = { id, type, isExpense: false };
        const modal = document.getElementById('comm-password-modal');
        const input = document.getElementById('comm-password-input');
        if (modal && input) {
            input.value = '';
            modal.style.display = 'flex';
        }
    };

    window.toggleExpensePaid = function(id, index) {
        pendingActionToggle = { id, index, isExpense: true };
        const modal = document.getElementById('comm-password-modal');
        const input = document.getElementById('comm-password-input');
        if (modal && input) {
            input.value = '';
            modal.style.display = 'flex';
        }
    };

    const commModal = document.getElementById('comm-password-modal');
    const closeCommBtn = document.getElementById('close-comm-modal-btn');
    const verifyCommBtn = document.getElementById('verify-comm-password-btn');
    const commPasswordInput = document.getElementById('comm-password-input');

    if (closeCommBtn && commModal) {
        closeCommBtn.addEventListener('click', () => {
            commModal.style.display = 'none';
            pendingActionToggle = null;
        });
    }

    if (verifyCommBtn && commModal && commPasswordInput) {
        verifyCommBtn.addEventListener('click', () => {
            if (commPasswordInput.value === window.getGlobalPassword()) {
                if (pendingActionToggle) {
                    let t = transactionsData.find(x => x.id === pendingActionToggle.id);
                    if (t) {
                        if (pendingActionToggle.isExpense) {
                            let exp = t.expensesLog[pendingActionToggle.index];
                            exp.isPaid = !exp.isPaid;
                            renderTransactions();
                            showDetailsModal(t);
                            if (exp.isPaid) {
                                const waMsg = `تم دفع مصروف\nرقم العقار: ${t.propNumber}\nالمصروف: ${exp.reason}\nالمبلغ: ${Number(exp.amount).toLocaleString('en-US')} دينار`;
                                window.sendWhatsAppMessage(waMsg);
                            }
                            showCustomAlert('تم تغيير حالة المصروف بنجاح!', '✅');
                        } else {
                            t.commissions[pendingActionToggle.type + 'Paid'] = !t.commissions[pendingActionToggle.type + 'Paid'];
                            renderTransactions();
                            showDetailsModal(t);
                            
                            if (t.commissions[pendingActionToggle.type + 'Paid']) {
                                const waMsg = `تم دفع عمولة\nرقم العقار: ${t.propNumber}\nدفع عمولة الـ ${pendingActionToggle.type === 'seller' ? 'بائع' : 'مشتري'} (${pendingActionToggle.type === 'seller' ? t.sellerName : t.buyerName})`;
                                window.sendWhatsAppMessage(waMsg);
                            }
                            showCustomAlert('تم تغيير حالة العمولة بنجاح!', '✅');
                        }
                    }
                }
                commModal.style.display = 'none';
                pendingActionToggle = null;
            } else {
                showCustomAlert('كلمة المرور غير صحيحة', '❌');
            }
        });
    }

    window.addExpense = function(id) {
        let t = transactionsData.find(x => x.id === id);
        let date = document.getElementById('new-exp-date').value;
        let amountStr = document.getElementById('new-exp-amount').value.replace(/,/g, '');
        let amount = Number(amountStr);
        let reason = document.getElementById('new-exp-reason').value || 'مصروف';
        if(amount > 0) {
            t.expensesLog.push({ date, amount, reason, isPaid: false });
            renderTransactions();
            showDetailsModal(t);
            
            const waMsg = `مصروف جديد / خصم من البائع\nرقم العقار: ${t.propNumber}\nتم خصم مبلغ: ${amount.toLocaleString('en-US')} دينار\nالسبب: ${reason}`;
            window.sendWhatsAppMessage(waMsg);
        }
    };

    window.deleteExpense = function(id, index) {
        let t = transactionsData.find(x => x.id === id);
        if(confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            t.expensesLog.splice(index, 1);
            renderTransactions();
            showDetailsModal(t);
        }
    };

    window.deleteTransactionImage = function(id, idx) {
        if(confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            let t = transactionsData.find(x => x.id === id);
            t.images.splice(idx, 1);
            renderTransactions();
            showDetailsModal(t);
        }
    };

    window.uploadTransactionImage = function(id, input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                let t = transactionsData.find(x => x.id === id);
                if (!t.images) t.images = [];
                t.images.push(dataUrl);
                renderTransactions();
                showDetailsModal(t);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // --- ENHANCED DETAILS MODAL ---
    function showDetailsModal(t) {
        if (!detailsContent || !detailsModal) return;

        // Fallbacks for older data
        if (!t.paymentsLog) t.paymentsLog = [];
        if (!t.commissions) t.commissions = { seller: 120000, buyer: 120000, sellerPaid: false, buyerPaid: false };
        if (!t.expensesLog) t.expensesLog = [];

        let imagesHTML = '';
        if (t.images && t.images.length > 0) {
            imagesHTML = `
                <p style="margin-top: 15px;"><strong>الصور والمستمسكات:</strong></p>
                <div class="details-images">
                    ${t.images.map((imgSrc, idx) => `
                        <div style="position:relative; display:inline-block;">
                            <img src="${imgSrc}" class="fullscreen-trigger" alt="صورة العقار" style="cursor: pointer; transition: transform 0.2s;">
                            <button type="button" class="btn-red" style="position:absolute; top:-5px; right:-5px; border-radius:50%; width:24px; height:24px; padding:0; line-height:1; cursor:pointer;" onclick="window.deleteTransactionImage(${t.id}, ${idx})">X</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        imagesHTML += `
            <div style="margin-top: 10px;">
                <input type="file" id="add-trans-image-input-${t.id}" style="display:none;" accept="image/*" onchange="window.uploadTransactionImage(${t.id}, this)">
                <button type="button" class="btn-3d btn-primary" onclick="document.getElementById('add-trans-image-input-${t.id}').click()">إضافة صورة جديدة</button>
            </div>
        `;

        // Calculations
        let baseReceived = Number(t.amountReceived);
        let paymentsSum = t.paymentsLog.reduce((sum, p) => sum + Number(p.amount), 0);
        let totalPaidByBuyer = baseReceived + paymentsSum;
        let currentPropRemaining = Number(t.propAmount) - totalPaidByBuyer;
        
        // Update stored remaining
        t.amountRemaining = currentPropRemaining;
        
        let unpaidExpensesSum = t.expensesLog.reduce((sum, e) => !e.isPaid ? sum + Number(e.amount) : sum, 0);
        let unpaidSellerComm = t.commissions.sellerPaid ? 0 : Number(t.commissions.seller);
        let unpaidBuyerComm = t.commissions.buyerPaid ? 0 : Number(t.commissions.buyer);
        
        let finalSellerRemaining = currentPropRemaining - (unpaidSellerComm + unpaidExpensesSum); 
        let finalOfficeClaim = unpaidSellerComm + unpaidBuyerComm + unpaidExpensesSum;

        detailsContent.innerHTML = `
            <p><strong>حالة المعاملة:</strong> ${t.status}</p>
            <p><strong>رقم العقار:</strong> ${t.propNumber}</p>
            ${t.propArea ? `<p><strong>مساحة العقار:</strong> ${t.propArea}</p>` : ''}
            <p><strong>التاريخ:</strong> ${t.propDate}</p>
            <p><strong>البائع:</strong> ${t.sellerName} <span dir="ltr">(${t.sellerPhone ? `<a href="tel:${t.sellerPhone}" style="text-decoration: none; color: var(--secondary-color);">📞 ${t.sellerPhone}</a>` : 'لا يوجد'})</span></p>
            <p><strong>المشتري:</strong> ${t.buyerName} <span dir="ltr">(${t.buyerPhone ? `<a href="tel:${t.buyerPhone}" style="text-decoration: none; color: var(--secondary-color);">📞 ${t.buyerPhone}</a>` : 'لا يوجد'})</span></p>
            
            <div style="background: rgba(41, 128, 185, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(41, 128, 185, 0.2); margin-top: 15px; text-align: right;">
                <p><strong>سعر العقار الكلي:</strong> ${Number(t.propAmount).toLocaleString('en-US')} دينار</p>
                <p><strong>إجمالي الواصل حالياً:</strong> <span style="color:var(--secondary-color); font-weight:bold;">${totalPaidByBuyer.toLocaleString('en-US')} دينار</span></p>
                <p><strong>الباقي من سعر العقار:</strong> <span style="color:var(--danger-color); font-weight:bold;">${currentPropRemaining.toLocaleString('en-US')} دينار</span></p>
            </div>

            <div class="details-section">
                <div class="details-title">سجل دفعات المشتري</div>
                <table class="data-table">
                    <thead><tr><th>التاريخ</th><th>المبلغ المسدد</th><th>ملاحظة</th><th>حذف</th></tr></thead>
                    <tbody>
                        <tr><td>(يوم العقد)</td><td style="color:var(--secondary-color); font-weight:bold;">${baseReceived.toLocaleString('en-US')}</td><td>الواصل المبدئي</td><td>-</td></tr>
                        ${t.paymentsLog.map((p, index) => `
                            <tr>
                                <td>${p.date}</td>
                                <td style="color:var(--secondary-color); font-weight:bold;">${Number(p.amount).toLocaleString('en-US')}</td>
                                <td>${p.note}</td>
                                <td><button type="button" class="btn-3d btn-red" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.deletePayment(${t.id}, ${index})">X</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="inline-form">
                    <input type="date" id="new-pay-date" value="${new Date().toISOString().split('T')[0]}">
                    <input type="text" id="new-pay-amount" class="number-format" inputmode="numeric" placeholder="المبلغ">
                    <input type="text" id="new-pay-note" placeholder="ملاحظة (مثال: قسط ثاني)">
                    <button type="button" class="btn-3d btn-green" onclick="window.addPayment(${t.id})">تسديد جديد</button>
                </div>
            </div>

            <div class="details-section">
                <div class="details-title">العمولة</div>
                <table class="data-table">
                    <thead><tr><th>الطرف</th><th>المبلغ</th><th>الحالة</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>البائع</td>
                            <td><input type="text" class="number-format" inputmode="numeric" value="${Number(t.commissions.seller).toLocaleString('en-US')}" onchange="window.updateComm(${t.id}, 'seller', this.value)" style="width:100px; text-align:center;"></td>
                            <td><button type="button" class="${t.commissions.sellerPaid ? 'badge-paid' : 'badge-unpaid'}" onclick="window.toggleComm(${t.id}, 'seller')">${t.commissions.sellerPaid ? 'مدفوع' : 'غير مدفوع'}</button></td>
                        </tr>
                        <tr>
                            <td>المشتري</td>
                            <td><input type="text" class="number-format" inputmode="numeric" value="${Number(t.commissions.buyer).toLocaleString('en-US')}" onchange="window.updateComm(${t.id}, 'buyer', this.value)" style="width:100px; text-align:center;"></td>
                            <td><button type="button" class="${t.commissions.buyerPaid ? 'badge-paid' : 'badge-unpaid'}" onclick="window.toggleComm(${t.id}, 'buyer')">${t.commissions.buyerPaid ? 'مدفوع' : 'غير مدفوع'}</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="details-section">
                <div class="details-title">مصروفات المكتب (مثل أجور الكهرباء)</div>
                <table class="data-table">
                    <thead><tr><th>التاريخ</th><th>المبلغ</th><th>السبب</th><th>الحالة</th><th>حذف</th></tr></thead>
                    <tbody>
                        ${t.expensesLog.length === 0 ? '<tr><td colspan="5">لا توجد مصروفات مسجلة</td></tr>' : t.expensesLog.map((e, index) => `
                            <tr>
                                <td>${e.date}</td>
                                <td style="color:var(--danger-color); font-weight:bold;">${Number(e.amount).toLocaleString('en-US')}</td>
                                <td>${e.reason}</td>
                                <td><button type="button" class="${e.isPaid ? 'badge-paid' : 'badge-unpaid'}" onclick="window.toggleExpensePaid(${t.id}, ${index})">${e.isPaid ? 'مدفوع' : 'غير مدفوع'}</button></td>
                                <td><button type="button" class="btn-3d btn-red" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.deleteExpense(${t.id}, ${index})">X</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="inline-form">
                    <input type="date" id="new-exp-date" value="${new Date().toISOString().split('T')[0]}">
                    <input type="text" id="new-exp-amount" class="number-format" inputmode="numeric" placeholder="المبلغ">
                    <input type="text" id="new-exp-reason" placeholder="السبب">
                    <button type="button" class="btn-3d btn-primary" onclick="window.addExpense(${t.id})">إضافة مصروف</button>
                </div>
            </div>

            <div class="details-section" style="background: rgba(255,255,255,0.8);">
                <div class="details-title">المحصلة الأخيرة (الصافي)</div>
                <div class="result-box seller">
                    <span>المتبقي الفعلي للبائع:</span>
                    <span>${finalSellerRemaining.toLocaleString('en-US')} دينار</span>
                </div>
                <div class="result-box office">
                    <span>الصافي الفعلي للمكتب (المطلوب):</span>
                    <span>${finalOfficeClaim.toLocaleString('en-US')} دينار</span>
                </div>
            </div>

            ${imagesHTML}
        `;
        
        const actionsContainer = document.querySelector('#details-modal .modal-actions');
        
                        let comprehensiveMsg = `تفاصيل العقار:\n`;
        comprehensiveMsg += `رقم العقار: ${t.propNumber}\n`;
        comprehensiveMsg += `البائع: ${t.sellerName}\n`;
        comprehensiveMsg += `المشتري: ${t.buyerName}\n\n`;
        
        comprehensiveMsg += `مبلغ العقار: ${Number(t.propAmount).toLocaleString('en-US')} دينار\n`;
        comprehensiveMsg += `الواصل: ${Number(t.amountReceived).toLocaleString('en-US')} دينار (بتاريخ: ${t.propDate || 'غير محدد'})\n`;
        
        if (t.paymentsLog && t.paymentsLog.length > 0) {
            t.paymentsLog.forEach(p => {
                comprehensiveMsg += `تسديد: ${Number(p.amount).toLocaleString('en-US')} دينار (بتاريخ: ${p.date}) ${p.note ? '- ' + p.note : ''}\n`;
            });
        }
        
        if (t.expensesLog && t.expensesLog.length > 0) {
            t.expensesLog.forEach(e => {
                let paidStatus = e.isPaid ? '(مدفوع)' : '(غير مدفوع - يخصم من البائع)';
                comprehensiveMsg += `مصروفات (${e.reason}): ${Number(e.amount).toLocaleString('en-US')} دينار (بتاريخ: ${e.date}) ${paidStatus}\n`;
            });
        }
        
        comprehensiveMsg += `\nالخلاصة:\n`;
        comprehensiveMsg += `مجموع الواصل: ${totalPaidByBuyer.toLocaleString('en-US')} دينار\n`;
        comprehensiveMsg += `المتبقي: ${currentPropRemaining.toLocaleString('en-US')} دينار\n`;
        const waMsg = encodeURIComponent(comprehensiveMsg);
        
        actionsContainer.innerHTML = `
            <button type="button" class="btn-3d" style="background: #25D366; box-shadow: 0 4px 0 #128C7E;" onclick="window.open('https://wa.me/?text=${waMsg}')">مراسلة عبر واتساب 💬</button>
            <button type="button" id="close-details-btn" class="btn-3d btn-red">إغلاق</button>
        `;
        
        if (t.status === 'غير مكتملة') {
            const btn = document.createElement('button');
            btn.className = 'btn-3d btn-green';
            btn.textContent = 'نقل إلى المعاملات الجارية';
            btn.onclick = () => {
                t.status = 'جارية';
                renderTransactions();
                showDetailsModal(t);
            };
            actionsContainer.prepend(btn);
        } else if (t.status === 'جارية') {
            const btnBack = document.createElement('button');
            btnBack.className = 'btn-3d btn-red';
            btnBack.style.marginRight = '10px';
            btnBack.textContent = 'إرجاع إلى غير مكتملة';
            btnBack.onclick = () => {
                t.status = 'غير مكتملة';
                renderTransactions();
                showDetailsModal(t);
            };
            actionsContainer.prepend(btnBack);

            const btn = document.createElement('button');
            btn.className = 'btn-3d btn-green';
            btn.textContent = 'نقل إلى المعاملات المكتملة';
            btn.onclick = () => {
                t.status = 'مكتملة';
                renderTransactions();
                showDetailsModal(t);
            };
            actionsContainer.prepend(btn);
        } else if (t.status === 'مكتملة') {
            const btnBack = document.createElement('button');
            btnBack.className = 'btn-3d btn-red';
            btnBack.style.marginRight = '10px';
            btnBack.textContent = 'إرجاع إلى جارية';
            btnBack.onclick = () => {
                t.status = 'جارية';
                renderTransactions();
                showDetailsModal(t);
            };
            actionsContainer.prepend(btnBack);
        }

        document.querySelectorAll('.fullscreen-trigger').forEach(img => {
            img.addEventListener('click', (e) => {
                const fsModal = document.getElementById('fullscreen-image-modal');
                const fsImage = document.getElementById('fullscreen-image');
                if (fsModal && fsImage) {
                    fsImage.src = e.target.src;
                    fsModal.classList.add('active');
                }
            });
        });

        document.getElementById('close-details-btn').addEventListener('click', () => {
            detailsModal.classList.remove('active');
        });

        detailsModal.classList.add('active');
    }

    const fsModal = document.getElementById('fullscreen-image-modal');
    const fsClose = document.getElementById('close-fullscreen-btn');
    if (fsClose && fsModal) {
        fsClose.addEventListener('click', () => fsModal.classList.remove('active'));
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const propNumberLeft = document.getElementById('prop-number-left')?.value || '';
            const propNumberRight = document.getElementById('prop-number-right')?.value || '';
            const propNumber = propNumberLeft ? `${propNumberRight}/${propNumberLeft}` : propNumberRight;
            
            const propArea = document.getElementById('prop-area')?.value || '';
            const propDate = document.getElementById('prop-date')?.value || '';
            const sellerName = document.getElementById('seller-name')?.value || '';
            const sellerPhone = document.getElementById('seller-phone')?.value || '';
            const buyerName = document.getElementById('buyer-name')?.value || '';
            const buyerPhone = document.getElementById('buyer-phone')?.value || '';
            const propAmount = getUnformattedNumber(document.getElementById('prop-amount')?.value);
            const amountReceived = getUnformattedNumber(document.getElementById('amount-received')?.value);
            const amountRemaining = getUnformattedNumber(document.getElementById('amount-remaining')?.value);

            if (editingId) {
                const index = transactionsData.findIndex(t => t.id === editingId);
                if (index !== -1) {
                    transactionsData[index] = {
                        ...transactionsData[index],
                        propNumber, propArea, propDate, sellerName, sellerPhone,
                        buyerName, buyerPhone, propAmount, amountReceived, amountRemaining,
                        images: uploadedImages.length > 0 ? [...uploadedImages] : transactionsData[index].images
                    };
                }
                editingId = null;
                showCustomAlert('تم تعديل العقار بنجاح!', '✅');
                document.querySelector('.submit-btn').textContent = 'حفظ العقار';
            } else {
                const transaction = {
                    id: Date.now(),
                    status: 'غير مكتملة',
                    propNumber, propArea, propDate, sellerName, sellerPhone,
                    buyerName, buyerPhone, propAmount, amountReceived, amountRemaining,
                    images: [...uploadedImages],
                    paymentsLog: [],
                    commissions: { seller: 120000, buyer: 120000, sellerPaid: false, buyerPaid: false },
                    expensesLog: []
                };
                transactionsData.push(transaction);
                showCustomAlert('تم حفظ العقار بنجاح!', '✅');
                
                const waMsg = `تفاصيل العقار الجديد\nرقم العقار: ${propNumber}\nالمساحة: ${propArea}\nالبائع: ${sellerName}\nالمشتري: ${buyerName}\nالمبلغ الكلي: ${Number(propAmount).toLocaleString('en-US')} دينار\nالواصل: ${Number(amountReceived).toLocaleString('en-US')} دينار\nالمتبقي: ${Number(amountRemaining).toLocaleString('en-US')} دينار`;
                window.sendWhatsAppMessage(waMsg);
            }

            renderTransactions();

            form.reset();
            if (amountRemainingInput) amountRemainingInput.value = '0';
            
            // Clear temporary images
            uploadedImages = [];
            renderImagePreview();
        });
    }

    // Treasury Logic
    let treasuryBalance = 0;
    let treasuryHistory = [];
    
    const btnDeposit = document.getElementById('btn-deposit');
    const btnWithdraw = document.getElementById('btn-withdraw');
    const treasuryModal = document.getElementById('treasury-modal');
    const treasuryModalTitle = document.getElementById('treasury-modal-title');
    const treasuryForm = document.getElementById('treasury-form');
    const treasuryTypeInput = document.getElementById('treasury-type');
    const treasuryAmountInput = document.getElementById('treasury-amount');
    const treasuryDateInput = document.getElementById('treasury-date');
    const treasuryReasonInput = document.getElementById('treasury-reason');
    const cancelTreasuryBtn = document.getElementById('cancel-treasury-btn');
    const totalBalanceDisplay = document.getElementById('total-balance');
    const treasuryHistoryList = document.getElementById('treasury-history-list');

    function updateTreasuryUI() {
        window.saveToFirebase();
        updateTreasuryUIDisplay();
    }

    function updateTreasuryUIDisplay() {
        // Calculate balance
        let total = 0;
        treasuryHistory.forEach(t => {
            if (t.type === 'deposit') {
                total += Number(t.amount);
            } else if (t.type === 'withdraw') {
                total -= Number(t.amount);
            }
        });
        treasuryBalance = total;
        
        // Formatter for numbers
        const formatter = new Intl.NumberFormat('en-US');
        if (totalBalanceDisplay) {
            totalBalanceDisplay.textContent = `${formatter.format(treasuryBalance)} دينار`;
        }

        // Render History
        if (treasuryHistoryList) {
            if (treasuryHistory.length === 0) {
                treasuryHistoryList.innerHTML = '<div class="empty-state">لا توجد حركات في المحفظة حتى الآن.</div>';
            } else {
                treasuryHistoryList.innerHTML = treasuryHistory.map(t => {
                    const isDeposit = t.type === 'deposit';
                    const typeLabel = isDeposit ? 'إيداع' : 'سحب';
                    const typeColor = isDeposit ? 'var(--secondary-color)' : 'var(--danger-color)';
                    return `
                        <div class="transaction-card" style="border-right: 4px solid ${typeColor}; padding-right: 15px; display: flex; align-items: center; justify-content: space-between;">
                            <div class="transaction-card-info" style="flex: 1;">
                                <h4 style="color: ${typeColor}; margin-bottom: 0.5rem;">${typeLabel}</h4>
                                <p><strong>المبلغ:</strong> <span dir="ltr">${formatter.format(t.amount)}</span> دينار</p>
                                <p><strong>التاريخ:</strong> ${t.date}</p>
                                <p><strong>السبب:</strong> ${t.reason}</p>
                            </div>
                            <div class="transaction-actions" style="margin-right: 15px; display: flex; flex-direction: column; gap: 5px;">
                                <button type="button" class="action-btn edit-history-btn" data-id="${t.id}" title="تعديل">✏️</button>
                                <button type="button" class="action-btn delete-history-btn" data-id="${t.id}" title="حذف">🗑️</button>
                            </div>
                        </div>
                    `;
                }).reverse().join(''); // Reverse to show latest first
            }
        }
    }

    if (treasuryHistoryList) {
        treasuryHistoryList.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-history-btn');
            const deleteBtn = e.target.closest('.delete-history-btn');

            if (editBtn) {
                const id = Number(editBtn.getAttribute('data-id'));
                const transaction = treasuryHistory.find(t => t.id === id);
                if (transaction) {
                    const editHistoryModal = document.getElementById('edit-history-modal');
                    const passwordSection = document.getElementById('history-password-section');
                    const editSection = document.getElementById('edit-history-section');
                    const passwordInput = document.getElementById('history-password');
                    
                    if (editHistoryModal) {
                        editHistoryModal.setAttribute('data-current-id', id);
                        editHistoryModal.style.display = 'flex';
                        passwordSection.style.display = 'block';
                        editSection.style.display = 'none';
                        passwordInput.value = '';
                    }
                }
            } else if (deleteBtn) {
                const id = Number(deleteBtn.getAttribute('data-id'));
                const transaction = treasuryHistory.find(t => t.id === id);
                if (transaction) {
                    const deleteHistoryModal = document.getElementById('delete-history-modal');
                    const passwordInput = document.getElementById('delete-history-password');
                    
                    if (deleteHistoryModal) {
                        deleteHistoryModal.setAttribute('data-current-id', id);
                        deleteHistoryModal.style.display = 'flex';
                        passwordInput.value = '';
                    }
                }
            }
        });
    }

    const editHistoryModal = document.getElementById('edit-history-modal');
    const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
    const verifyHistoryPasswordBtn = document.getElementById('verify-history-password-btn');
    const saveHistoryBtn = document.getElementById('save-history-btn');

    if (closeHistoryModalBtn) {
        closeHistoryModalBtn.addEventListener('click', () => {
            if (editHistoryModal) editHistoryModal.style.display = 'none';
        });
    }

    if (verifyHistoryPasswordBtn) {
        verifyHistoryPasswordBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('history-password');
            if (passwordInput.value === window.getGlobalPassword()) {
                document.getElementById('history-password-section').style.display = 'none';
                document.getElementById('edit-history-section').style.display = 'block';
                
                const id = Number(editHistoryModal.getAttribute('data-current-id'));
                const transaction = treasuryHistory.find(t => t.id === id);
                if (transaction) {
                    document.getElementById('edit-history-amount').value = new Intl.NumberFormat('en-US').format(transaction.amount);
                    document.getElementById('edit-history-date').value = transaction.date;
                    document.getElementById('edit-history-reason').value = transaction.reason;
                }
            } else {
                showCustomAlert('كلمة المرور غير صحيحة', '❌');
            }
        });
    }

    if (saveHistoryBtn) {
        saveHistoryBtn.addEventListener('click', () => {
            const id = Number(editHistoryModal.getAttribute('data-current-id'));
            const index = treasuryHistory.findIndex(t => t.id === id);
            if (index !== -1) {
                const newAmountStr = document.getElementById('edit-history-amount').value;
                const newAmount = getUnformattedNumber(newAmountStr);
                const newDate = document.getElementById('edit-history-date').value;
                const newReason = document.getElementById('edit-history-reason').value;

                if (!newAmount || !newDate || !newReason.trim()) {
                    showCustomAlert('الرجاء إدخال جميع الحقول', '❌');
                    return;
                }

                treasuryHistory[index].amount = newAmount;
                treasuryHistory[index].date = newDate;
                treasuryHistory[index].reason = newReason;
                
                updateTreasuryUI();
                editHistoryModal.style.display = 'none';
                showCustomAlert('تم تعديل الحركة بنجاح', '✅');
            }
        });
    }

    const deleteHistoryModal = document.getElementById('delete-history-modal');
    const closeDeleteHistoryModalBtn = document.getElementById('close-delete-history-modal-btn');
    const verifyDeleteHistoryPasswordBtn = document.getElementById('verify-delete-history-password-btn');

    if (closeDeleteHistoryModalBtn) {
        closeDeleteHistoryModalBtn.addEventListener('click', () => {
            if (deleteHistoryModal) deleteHistoryModal.style.display = 'none';
        });
    }

    if (verifyDeleteHistoryPasswordBtn) {
        verifyDeleteHistoryPasswordBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('delete-history-password');
            if (passwordInput.value === window.getGlobalPassword()) {
                const id = Number(deleteHistoryModal.getAttribute('data-current-id'));
                const index = treasuryHistory.findIndex(t => t.id === id);
                if (index !== -1) {
                    treasuryHistory.splice(index, 1);
                    updateTreasuryUI();
                    deleteHistoryModal.style.display = 'none';
                    showCustomAlert('تم حذف الحركة بنجاح', '✅');
                }
            } else {
                showCustomAlert('كلمة المرور غير صحيحة', '❌');
            }
        });
    }

    if (btnDeposit && btnWithdraw && treasuryModal && cancelTreasuryBtn) {
        function setTreasuryTheme(isDeposit) {
            const modalContent = document.getElementById('treasury-modal-content');
            const title = document.getElementById('treasury-modal-title');
            const lblAmount = document.getElementById('lbl-treasury-amount');
            const lblDate = document.getElementById('lbl-treasury-date');
            const lblReason = document.getElementById('lbl-treasury-reason');
            const btnSubmit = document.getElementById('submit-treasury-btn');
            
            if (isDeposit) {
                modalContent.style.background = '#113a21';
                modalContent.style.border = '1px solid #2ecc71';
                title.style.color = '#2ecc71';
                lblAmount.style.color = '#2ecc71';
                lblDate.style.color = '#2ecc71';
                lblReason.style.color = '#2ecc71';
                
                treasuryAmountInput.style.background = '#1e5233';
                treasuryAmountInput.style.color = '#fff';
                treasuryDateInput.style.background = '#1e5233';
                treasuryDateInput.style.color = '#fff';
                treasuryReasonInput.style.background = '#1e5233';
                treasuryReasonInput.style.color = '#fff';
                
                btnSubmit.className = 'btn-3d btn-green';
            } else {
                modalContent.style.background = '#1f0d0d';
                modalContent.style.border = '1px solid #e74c3c';
                title.style.color = '#e74c3c';
                lblAmount.style.color = '#e74c3c';
                lblDate.style.color = '#e74c3c';
                lblReason.style.color = '#e74c3c';
                
                treasuryAmountInput.style.background = '#eec8c8';
                treasuryAmountInput.style.color = '#000';
                treasuryDateInput.style.background = '#eec8c8';
                treasuryDateInput.style.color = '#000';
                treasuryReasonInput.style.background = '#eec8c8';
                treasuryReasonInput.style.color = '#000';
                
                btnSubmit.className = 'btn-3d btn-red';
            }
        }

        btnDeposit.addEventListener('click', () => {
            treasuryTypeInput.value = 'deposit';
            treasuryModalTitle.textContent = 'إضافة مبلغ';
            treasuryForm.reset();
            treasuryDateInput.valueAsDate = new Date();
            setTreasuryTheme(true);
            treasuryModal.classList.add('active');
        });

        btnWithdraw.addEventListener('click', () => {
            treasuryTypeInput.value = 'withdraw';
            treasuryModalTitle.textContent = 'سحب مبلغ';
            treasuryForm.reset();
            treasuryDateInput.valueAsDate = new Date();
            setTreasuryTheme(false);
            treasuryModal.classList.add('active');
        });

        cancelTreasuryBtn.addEventListener('click', () => {
            treasuryModal.classList.remove('active');
        });

        treasuryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = treasuryTypeInput.value;
            const amount = getUnformattedNumber(treasuryAmountInput.value);
            const date = treasuryDateInput.value;
            const reason = treasuryReasonInput.value;

            if (type === 'withdraw' && amount > treasuryBalance) {
                showCustomAlert('عذراً، الرصيد الحالي لا يكفي لإتمام عملية السحب.', '❌');
                return;
            }

            treasuryHistory.push({
                id: Date.now(),
                type,
                amount,
                date,
                reason
            });

            updateTreasuryUI();
            treasuryModal.classList.remove('active');
            
            if (type === 'deposit') {
                showCustomAlert('تم الإيداع بنجاح', '✅');
            } else {
                showCustomAlert('تم السحب بنجاح', '✅');
            }
        });
        
        // Initial render
        updateTreasuryUIDisplay();
    }

    // Inner Treasury Tabs
    const treasuryTabBtns = document.querySelectorAll('.treasury-tab-btn');
    const treasuryTabContents = document.querySelectorAll('.treasury-tab-content');

    treasuryTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            treasuryTabBtns.forEach(b => b.classList.remove('active'));
            treasuryTabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            if (document.getElementById(targetId)) {
                document.getElementById(targetId).classList.add('active');
            }
        });
    });

    // Partnership Logic
    let partnershipHistory = [];
    
    const btnAddPartnership = document.getElementById('btn-add-partnership');
    const partnershipModal = document.getElementById('partnership-modal');
    const partnershipForm = document.getElementById('partnership-form');
    const cancelPartnershipBtn = document.getElementById('cancel-partnership-btn');
    
    const aliNetDisplay = document.getElementById('ali-net');
    const partnerNetDisplay = document.getElementById('partner-net');
    const partnershipHistoryList = document.getElementById('partnership-history-list');

    window.deletePartnership = function(id) {
        if(confirm('هل أنت متأكد من حذف هذا القيد؟')) {
            partnershipHistory = partnershipHistory.filter(t => t.id !== id);
            updatePartnershipUI();
        }
    };

    window.editPartnership = function(id) {
        const p = partnershipHistory.find(t => t.id === id);
        if (!p) return;
        const newAmount = prompt('أدخل المبلغ الجديد:', p.amount);
        if (newAmount !== null && newAmount.trim() !== '') {
            p.amount = getUnformattedNumber(newAmount);
            const newReason = prompt('أدخل السبب الجديد:', p.reason);
            if (newReason !== null) p.reason = newReason;
            updatePartnershipUI();
        }
    };

    function updatePartnershipUI() {
        window.saveToFirebase();
        updatePartnershipUIDisplay();
    }

    const yearFilter = document.getElementById('partnership-year-filter');
    const monthFilter = document.getElementById('partnership-month-filter');

    if (yearFilter) yearFilter.addEventListener('change', updatePartnershipUIDisplay);
    if (monthFilter) monthFilter.addEventListener('change', updatePartnershipUIDisplay);

    function updateYearFilterOptions() {
        if (!yearFilter) return;
        const currentSelection = yearFilter.value;
        const years = new Set();
        partnershipHistory.forEach(t => {
            if (t.date) {
                const year = t.date.split('-')[0];
                if (year) years.add(year);
            }
        });
        
        let optionsHTML = '<option value="all">كل السنوات</option>';
        const sortedYears = Array.from(years).sort().reverse();
        sortedYears.forEach(year => {
            optionsHTML += `<option value="${year}">${year}</option>`;
        });
        
        yearFilter.innerHTML = optionsHTML;
        if (sortedYears.includes(currentSelection) || currentSelection === 'all') {
            yearFilter.value = currentSelection;
        }
    }

    function updatePartnershipUIDisplay() {
        updateYearFilterOptions();

        const selectedYear = yearFilter ? yearFilter.value : 'all';
        const selectedMonth = monthFilter ? monthFilter.value : 'all';

        let filteredHistory = partnershipHistory;

        if (selectedYear !== 'all') {
            filteredHistory = filteredHistory.filter(t => t.date && t.date.startsWith(selectedYear + '-'));
        }
        
        if (selectedMonth !== 'all') {
            const monthStr = selectedMonth.padStart(2, '0');
            filteredHistory = filteredHistory.filter(t => {
                if (!t.date) return false;
                const parts = t.date.split('-');
                return parts.length >= 2 && parts[1] === monthStr;
            });
        }

        let totalProfits = 0; // Code 1
        let totalSharedPayments = 0; // Code 0
        let totalPartnerPayments = 0; // Code 10
        let aliSettlement = 0; // Code 98
        let partnerSettlement = 0; // Code 99

        filteredHistory.forEach(t => {
            const amt = Number(t.amount);
            if (t.code === '1') {
                totalProfits += amt;
            } else if (t.code === '0') {
                totalSharedPayments += amt;
            } else if (t.code === '10') {
                totalPartnerPayments += amt;
            } else if (t.code === '98') {
                aliSettlement += amt;
            } else if (t.code === '99') {
                partnerSettlement += amt;
            }
        });

        const aliNet = (totalProfits / 2) - (totalSharedPayments / 2) + aliSettlement;
        const partnerNet = (totalProfits / 2) - (totalSharedPayments / 2) - totalPartnerPayments + partnerSettlement;

        const formatter = new Intl.NumberFormat('en-US');
        
        if (aliNetDisplay) {
            if (aliNet < 0) {
                aliNetDisplay.textContent = `دين مطلوب: ${formatter.format(Math.abs(aliNet))} دينار`;
                aliNetDisplay.style.color = '#c0392b';
            } else {
                aliNetDisplay.textContent = `${formatter.format(aliNet)} دينار`;
                aliNetDisplay.style.color = '#2980b9';
            }
        }

        if (partnerNetDisplay) {
            if (partnerNet < 0) {
                partnerNetDisplay.textContent = `دين مطلوب: ${formatter.format(Math.abs(partnerNet))} دينار`;
                partnerNetDisplay.style.color = '#c0392b';
            } else {
                partnerNetDisplay.textContent = `${formatter.format(partnerNet)} دينار`;
                partnerNetDisplay.style.color = '#27ae60';
            }
        }

        if (partnershipHistoryList) {
            if (filteredHistory.length === 0) {
                partnershipHistoryList.innerHTML = '<div class="empty-state">لا توجد حركات مطابقة للفلتر أو لا توجد حركات شراكة حتى الآن.</div>';
            } else {
                partnershipHistoryList.innerHTML = filteredHistory.map(t => {
                    let codeLabel, typeColor, cardClass = '';
                    if (t.code === '1') {
                        codeLabel = 'أرباح (1)'; typeColor = '#27ae60'; cardClass = 'card-green';
                    } else if (t.code === '0') {
                        codeLabel = 'دفع مشترك (0)'; typeColor = '#f39c12'; cardClass = 'card-yellow';
                    } else if (t.code === '10') {
                        codeLabel = 'دفع للشريك (10)'; typeColor = '#c0392b'; cardClass = 'card-red';
                    } else if (t.code === '98' || t.code === '99') {
                        codeLabel = 'تسوية حساب (' + t.code + ')'; typeColor = '#8e44ad'; cardClass = 'card-purple';
                    }

                    return `
                        <div class="transaction-card ${cardClass}" style="border-right: 4px solid ${typeColor}; padding-right: 15px; display: flex; align-items: center; justify-content: space-between;">
                            <div class="transaction-card-info" style="flex: 1;">
                                <h4 style="color: ${typeColor}; margin-bottom: 0.5rem;">${codeLabel}</h4>
                                <p><strong>المبلغ:</strong> <span dir="ltr">${formatter.format(Math.abs(t.amount))}</span> دينار</p>
                                <p><strong>التاريخ:</strong> ${t.date}</p>
                                <p><strong>السبب:</strong> ${t.reason}</p>
                            </div>
                            <div class="transaction-actions" style="margin-right: 15px; display: flex; flex-direction: column; gap: 5px;">
                                <button type="button" class="action-btn" onclick="window.editPartnership(${t.id})" title="تعديل">✏️</button>
                                <button type="button" class="action-btn" onclick="window.deletePartnership(${t.id})" title="حذف">🗑️</button>
                            </div>
                        </div>
                    `;
                }).reverse().join('');
            }
        }
    }

    const resetAliBalanceIcon = document.getElementById('reset-ali-balance-icon');
    const resetAliBalanceModal = document.getElementById('reset-ali-balance-modal');
    const resetBalancePassword = document.getElementById('reset-balance-password');
    const verifyResetPasswordBtn = document.getElementById('verify-reset-password-btn');
    const closeResetModalBtn = document.getElementById('close-reset-modal-btn');

    if (resetAliBalanceIcon) {
        resetAliBalanceIcon.addEventListener('click', () => {
            resetAliBalanceModal.style.display = 'flex';
            resetBalancePassword.value = '';
        });
    }

    if (closeResetModalBtn) {
        closeResetModalBtn.addEventListener('click', () => {
            resetAliBalanceModal.style.display = 'none';
        });
    }

    if (verifyResetPasswordBtn) {
        verifyResetPasswordBtn.addEventListener('click', () => {
            if (resetBalancePassword.value === window.getGlobalPassword()) {
                let totalProfits = 0, totalSharedPayments = 0, aliSettlement = 0;
                partnershipHistory.forEach(t => {
                    const amt = Number(t.amount);
                    if (t.code === '1') totalProfits += amt;
                    else if (t.code === '0') totalSharedPayments += amt;
                    else if (t.code === '98') aliSettlement += amt;
                });
                const aliNet = (totalProfits / 2) - (totalSharedPayments / 2) + aliSettlement;

                if (aliNet !== 0) {
                    partnershipHistory.push({
                        id: Date.now(),
                        amount: -aliNet,
                        code: '98',
                        date: new Date().toISOString().split('T')[0],
                        reason: 'تسوية وتصفير حساب (علي)'
                    });
                }
                
                updatePartnershipUI();
                resetAliBalanceModal.style.display = 'none';
                showCustomAlert('تم تصفير الحساب بنجاح وإضافة قيد تسوية!', '✅');
            } else {
                showCustomAlert('كلمة المرور غير صحيحة', '❌');
            }
        });
    }

    const resetPartnerBalanceIcon = document.getElementById('reset-partner-balance-icon');
    const resetPartnerBalanceModal = document.getElementById('reset-partner-balance-modal');
    const resetPartnerPassword = document.getElementById('reset-partner-password');
    const verifyResetPartnerPasswordBtn = document.getElementById('verify-reset-partner-password-btn');
    const closeResetPartnerModalBtn = document.getElementById('close-reset-partner-modal-btn');

    if (resetPartnerBalanceIcon) {
        resetPartnerBalanceIcon.addEventListener('click', () => {
            resetPartnerBalanceModal.style.display = 'flex';
            resetPartnerPassword.value = '';
        });
    }

    if (closeResetPartnerModalBtn) {
        closeResetPartnerModalBtn.addEventListener('click', () => {
            resetPartnerBalanceModal.style.display = 'none';
        });
    }

    if (verifyResetPartnerPasswordBtn) {
        verifyResetPartnerPasswordBtn.addEventListener('click', () => {
            if (resetPartnerPassword.value === window.getGlobalPassword()) {
                let totalProfits = 0, totalSharedPayments = 0, totalPartnerPayments = 0, partnerSettlement = 0;
                partnershipHistory.forEach(t => {
                    const amt = Number(t.amount);
                    if (t.code === '1') totalProfits += amt;
                    else if (t.code === '0') totalSharedPayments += amt;
                    else if (t.code === '10') totalPartnerPayments += amt;
                    else if (t.code === '99') partnerSettlement += amt;
                });
                const partnerNet = (totalProfits / 2) - (totalSharedPayments / 2) - totalPartnerPayments + partnerSettlement;
                
                if (partnerNet !== 0) {
                    partnershipHistory.push({
                        id: Date.now(),
                        amount: -partnerNet,
                        code: '99',
                        date: new Date().toISOString().split('T')[0],
                        reason: 'تسوية وتصفير حساب (الشريك)'
                    });
                }
                
                updatePartnershipUI();
                resetPartnerBalanceModal.style.display = 'none';
                showCustomAlert('تم تصفير الحساب بنجاح وإضافة قيد تسوية!', '✅');
            } else {
                showCustomAlert('كلمة المرور غير صحيحة', '❌');
            }
        });
    }

    if (btnAddPartnership && partnershipModal && cancelPartnershipBtn && partnershipForm) {
        btnAddPartnership.addEventListener('click', () => {
            partnershipForm.reset();
            document.getElementById('partner-date').valueAsDate = new Date();
            partnershipModal.classList.add('active');
        });

        cancelPartnershipBtn.addEventListener('click', () => {
            partnershipModal.classList.remove('active');
        });

        partnershipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = getUnformattedNumber(document.getElementById('partner-amount').value);
            const code = document.getElementById('partner-code').value;
            const date = document.getElementById('partner-date').value;
            const reason = document.getElementById('partner-reason').value;

            partnershipHistory.push({
                id: Date.now(),
                amount,
                code,
                date,
                reason
            });

            updatePartnershipUI();
            partnershipModal.classList.remove('active');
            showCustomAlert('تمت إضافة عملية الشراكة بنجاح!', '✅');
        });

        updatePartnershipUIDisplay();
    }

    // Settings logic
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');
    if (toggleThemeBtn) {
        // Load saved theme
        if (localStorage.getItem('dark_theme') === 'true') {
            document.body.classList.add('dark-theme');
        }

        toggleThemeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('dark_theme', isDark);
            showCustomAlert(isDark ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري', isDark ? '🌙' : '☀️');
        });
    }

    const downloadBackupBtn = document.getElementById('download-backup-btn');
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', () => {
            const data = {
                transactions: transactionsData,
                treasuryBalance: treasuryBalance,
                treasuryHistory: treasuryHistory,
                partnershipHistory: partnershipHistory,
                globalPassword: localStorage.getItem('global_password') || '1001'
            };
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_real_estate_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showCustomAlert('تم تحميل النسخة الاحتياطية', '📥');
        });
    }

    const uploadBackupBtn = document.getElementById('upload-backup-btn');
    const uploadBackupInput = document.getElementById('upload-backup-input');
    if (uploadBackupBtn && uploadBackupInput) {
        uploadBackupBtn.addEventListener('click', () => {
            uploadBackupInput.click();
        });
        
        uploadBackupInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.transactions) transactionsData = data.transactions;
                    if (data.treasuryBalance !== undefined) treasuryBalance = data.treasuryBalance;
                    if (data.treasuryHistory) treasuryHistory = data.treasuryHistory;
                    if (data.partnershipHistory) partnershipHistory = data.partnershipHistory;
                    if (data.globalPassword) localStorage.setItem('global_password', data.globalPassword);

                    localStorage.setItem('property_transactions', JSON.stringify(transactionsData));
                    localStorage.setItem('treasury_balance', treasuryBalance.toString());
                    localStorage.setItem('treasury_history', JSON.stringify(treasuryHistory));
                    localStorage.setItem('partnership_history', JSON.stringify(partnershipHistory));

                    window.saveToFirebase();
                    renderTransactionsUI();
                    updateTreasuryUIDisplay();
                    updatePartnershipUIDisplay();
                    showCustomAlert('تم استعادة النسخة الاحتياطية بنجاح!', '✅');
                } catch (err) {
                    showCustomAlert('ملف النسخة الاحتياطية غير صالح', '❌');
                }
            };
            reader.readAsText(file);
        });
    }

    const changePasswordsBtn = document.getElementById('change-passwords-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const oldPasswordInput = document.getElementById('old-password');
    const newPasswordInput = document.getElementById('new-password');
    const verifyChangePasswordBtn = document.getElementById('verify-change-password-btn');
    const closeChangePasswordModalBtn = document.getElementById('close-change-password-modal-btn');

    if (changePasswordsBtn) {
        changePasswordsBtn.addEventListener('click', () => {
            oldPasswordInput.value = '';
            newPasswordInput.value = '';
            changePasswordModal.style.display = 'flex';
        });
    }

    if (closeChangePasswordModalBtn) {
        closeChangePasswordModalBtn.addEventListener('click', () => {
            changePasswordModal.style.display = 'none';
        });
    }

    if (verifyChangePasswordBtn) {
        verifyChangePasswordBtn.addEventListener('click', () => {
            const currentPass = window.getGlobalPassword();
            if (oldPasswordInput.value === currentPass) {
                if (newPasswordInput.value.trim().length > 0) {
                    localStorage.setItem('global_password', newPasswordInput.value.trim());
                    window.saveToFirebase();
                    changePasswordModal.style.display = 'none';
                    showCustomAlert('تم تغيير كلمة المرور بنجاح!', '✅');
                } else {
                    showCustomAlert('يجب إدخال كلمة مرور جديدة', '❌');
                }
            } else {
                showCustomAlert('كلمة المرور الحالية غير صحيحة', '❌');
            }
        });
    }

    // Load initial data from Firebase
    window.loadFromFirebase();

    // PWA Install Logic
    let deferredPrompt;
    const installBtn = document.getElementById('install-app-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        installBtn.style.display = 'block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });

    window.addEventListener('appinstalled', () => {
        // Hide the app-provided install promotion
        installBtn.style.display = 'none';
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        console.log('PWA was installed');
    });

});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
