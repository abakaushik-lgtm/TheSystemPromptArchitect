/* ==========================================================================
   AURELIA - STATEFUL INTERACTIVE CONCIERGE ENGINE
   ========================================================================== */

// Client Session State
const state = {
    currentStep: 'welcome', // welcome, discovery, curation, objections, closing, completed
    destination: '',
    style: '',
    budget: 0,
    basePrice: 0,
    finalPrice: 0,
    unlockedPerks: {
        upgrade: false,
        spa: false,
        transfer: false,
        discount: false
    },
    discountPercentage: 0,
    customItinerary: null
};

// Travel Itinerary Database (Pre-Curated Ultra-Luxury Experiences)
const travelDatabase = {
    honeymoon: {
        title: "Santorini & Amalfi Coast Honeymoon",
        heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        basePrice: 15500,
        hotelName: "Grace Hotel, Auberge Resorts & Caruso, A Belmond Hotel",
        hotelDesc: "4 nights in a sea-view Grace Suite with private plunge pool (Santorini) and 3 nights in a panoramic Sea View Junior Suite (Ravello).",
        transferName: "Private Jet-Connection & Elite Chauffeur",
        transferDesc: "Executive helicopter transfers between airports and custom chauffeured Mercedes S-Class for all land movements.",
        experienceName: "Bespoke Sunset Yacht & Cliffside Dining",
        experienceDesc: "A private 42-foot motor yacht excursion around Santorini at sunset, followed by a romantic tasting menu in Ravello."
    },
    yacht: {
        title: "French Riviera Superyacht Charter",
        heroImage: "https://images.unsplash.com/photo-1505080856163-267d49b30626?auto=format&fit=crop&w=1200&q=80",
        basePrice: 28000,
        hotelName: "Hotel de Paris Monte-Carlo",
        hotelDesc: "2 nights in a Diamond Suite (Monaco) followed by 5 nights aboard the 95ft luxury charter yacht 'Celestia I' cruising the Riviera.",
        transferName: "VIP Helipair & Supercar Chauffeur",
        transferDesc: "Private helicopter transfer from Nice Côte d'Azur Airport directly to Monaco, paired with a classic Bentley chauffeur.",
        experienceName: "Michelin Cliffside Dining & Private Beach",
        experienceDesc: "Reserved VIP beach pavilion in Saint-Tropez, accompanied by a curated Chef's table dinner at Le Louis XV-Alain Ducasse."
    },
    alps: {
        title: "Zermatt Private Alpine Retreat",
        heroImage: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
        basePrice: 19500,
        hotelName: "The Omnia Mountain Lodge",
        hotelDesc: "7 nights in a breathtaking Mountain Suite featuring private outdoor hot tub and unmatched Matterhorn vistas.",
        transferName: "Glacier Express Excellence & Chauffeur",
        transferDesc: "Private premium carriage on the Glacier Express, supplemented by electric car transfers in car-free Zermatt.",
        experienceName: "Private Heli-Skiing & Michelin Chalet Dining",
        experienceDesc: "Guided private heli-skiing excursion in Zermatt, paired with a private chef-prepared fondue and wine tasting in-chalet."
    }
};

// DOM Elements
const chatFeed = document.getElementById('chat-feed');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');
const suggestionChips = document.getElementById('suggestion-chips');
const emptyItinerary = document.getElementById('empty-itinerary');
const populatedItinerary = document.getElementById('populated-itinerary');
const currentTimeEl = document.getElementById('current-time');

// Itinerary UI Elements
const itinDestTitle = document.getElementById('itin-destination-title');
const itinHotelName = document.getElementById('itin-hotel-name');
const itinHotelDesc = document.getElementById('itin-hotel-desc');
const itinTransferName = document.getElementById('itin-transfer-name');
const itinTransferDesc = document.getElementById('itin-transfer-desc');
const itinExperienceName = document.getElementById('itin-experience-name');
const itinExperienceDesc = document.getElementById('itin-experience-desc');
const destinationHero = document.getElementById('destination-hero');

// Itinerary Badges
const badgeRoomUpgrade = document.getElementById('itin-room-upgrade-badge');
const badgeAirportTransfer = document.getElementById('itin-airport-transfer-badge');
const badgeSpa = document.getElementById('itin-spa-badge');
const badgeDining = document.getElementById('itin-dining-badge');

// Pricing Elements
const originalPriceVal = document.getElementById('original-price-val');
const discountRow = document.getElementById('discount-row');
const discountVal = document.getElementById('discount-val');
const finalPriceVal = document.getElementById('final-price-val');

// Modal Elements
const consultationModal = document.getElementById('consultation-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const bookingForm = document.getElementById('booking-form');

// Tracker Indicators
const indicators = {
    1: document.getElementById('step-1-indicator'),
    2: document.getElementById('step-2-indicator'),
    3: document.getElementById('step-3-indicator'),
    4: document.getElementById('step-4-indicator')
};

// Set Current Local Time
function updateTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' GMT';
}
setInterval(updateTime, 60000);
updateTime();

// Utility: Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// Dialog Engine helper: Send a message as Aurelia with typing delay
function sendAureliaMessage(text, callback = null) {
    // Render Typing Indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message message-aurelia animate-fade-in';
    typingIndicator.innerHTML = `
        <div class="message-bubble">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    chatFeed.appendChild(typingIndicator);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    // Simulate luxury elegance typing latency
    const wordsCount = text.split(' ').length;
    const typingDelay = Math.max(1000, Math.min(3000, wordsCount * 45));

    setTimeout(() => {
        // Remove typing indicator
        chatFeed.removeChild(typingIndicator);

        // Render Actual Message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-aurelia';
        messageDiv.innerHTML = `
            <div class="message-bubble">${text}</div>
            <div class="message-meta">Aurelia • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatFeed.appendChild(messageDiv);
        chatFeed.scrollTop = chatFeed.scrollHeight;

        if (callback) callback();
    }, typingDelay);
}

// Dialog Engine helper: Send message as User
function sendUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-user';
    messageDiv.innerHTML = `
        <div class="message-bubble">${text}</div>
        <div class="message-meta">You • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    chatFeed.appendChild(messageDiv);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

// Render System Notification inside chat
function sendSystemNotification(text) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'message message-system animate-fade-in';
    notificationDiv.innerHTML = `
        <div class="message-system-inner">
            <i class="fa-solid fa-crown"></i> ${text}
        </div>
    `;
    chatFeed.appendChild(notificationDiv);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

// Render Interactive Suggestion Chips
function renderChips(chipsArray) {
    suggestionChips.innerHTML = '';
    chipsArray.forEach(chip => {
        const button = document.createElement('button');
        button.className = 'chip animate-fade-in';
        button.innerHTML = chip.icon ? `<i class="${chip.icon}"></i> ${chip.text}` : chip.text;
        button.addEventListener('click', () => handleUserInput(chip.text, chip.value));
        suggestionChips.appendChild(button);
    });
}

// Step Indicator Management
function setStepActive(stepNumber) {
    Object.keys(indicators).forEach(num => {
        const ind = indicators[num];
        ind.className = 'tracker-step';
        if (num < stepNumber) {
            ind.classList.add('completed');
            ind.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (num == stepNumber) {
            ind.classList.add('active');
            // Restore icon if active
            if (num == 1) ind.innerHTML = '<i class="fa-solid fa-comments"></i>';
            if (num == 2) ind.innerHTML = '<i class="fa-solid fa-map-location-dot"></i>';
            if (num == 3) ind.innerHTML = '<i class="fa-solid fa-sliders"></i>';
            if (num == 4) ind.innerHTML = '<i class="fa-solid fa-check-double"></i>';
        } else {
            if (num == 1) ind.innerHTML = '<i class="fa-solid fa-comments"></i>';
            if (num == 2) ind.innerHTML = '<i class="fa-solid fa-map-location-dot"></i>';
            if (num == 3) ind.innerHTML = '<i class="fa-solid fa-sliders"></i>';
            if (num == 4) ind.innerHTML = '<i class="fa-solid fa-check-double"></i>';
        }
    });
}

// ITINERARY VISUALIZER ENGINE
function updateItineraryUI() {
    if (!state.customItinerary) {
        emptyItinerary.classList.remove('d-none');
        populatedItinerary.classList.add('d-none');
        return;
    }

    emptyItinerary.classList.add('d-none');
    populatedItinerary.classList.remove('d-none');

    const itin = state.customItinerary;

    // Load Basic Details
    itinDestTitle.textContent = itin.title;
    destinationHero.style.backgroundImage = `url('${itin.heroImage}')`;
    itinHotelName.textContent = itin.hotelName;
    itinHotelDesc.textContent = itin.hotelDesc;
    itinTransferName.textContent = itin.transferName;
    itinTransferDesc.textContent = itin.transferDesc;
    itinExperienceName.textContent = itin.experienceName;
    itinExperienceDesc.textContent = itin.experienceDesc;

    // Process Perks Badges
    badgeRoomUpgrade.style.display = state.unlockedPerks.upgrade ? 'inline-flex' : 'none';
    badgeAirportTransfer.style.display = state.unlockedPerks.transfer ? 'inline-flex' : 'none';
    badgeSpa.style.display = state.unlockedPerks.spa ? 'inline-flex' : 'none';
    badgeDining.style.display = state.unlockedPerks.dining ? 'inline-flex' : 'none';

    // Pricing Matrix
    originalPriceVal.textContent = formatCurrency(state.basePrice);
    
    if (state.discountPercentage > 0) {
        discountRow.style.display = 'flex';
        const discountAmt = state.basePrice * (state.discountPercentage / 100);
        state.finalPrice = state.basePrice - discountAmt;
        discountVal.textContent = `-${formatCurrency(discountAmt)}`;
    } else {
        discountRow.style.display = 'none';
        state.finalPrice = state.basePrice;
    }

    finalPriceVal.textContent = formatCurrency(state.finalPrice);
}

// DIALOG FLOW ENGINE
function startConversation() {
    setStepActive(1);
    sendAureliaMessage(
        "Welcome to **Celestia Voyages**. I am **Aurelia**, your dedicated luxury travel consultant. It is an absolute pleasure to welcome you to our private member portal.<br><br>To design a travel experience tailored entirely to your desires, please share: where are you considering traveling next? And do you have a preferred timeline or special celebration, such as a honeymoon?",
        () => {
            renderChips([
                { text: "A European Honeymoon (approx. $15,000)", value: "honeymoon" },
                { text: "A French Riviera Yacht Charter", value: "yacht" },
                { text: "A Private Chalet Retreat in Zermatt", value: "alps" }
            ]);
        }
    );
}

function handleUserInput(userText, value = null) {
    if (!userText.trim()) return;

    // Send User Message in Chat
    sendUserMessage(userText);
    
    // Clear Input field
    chatInput.value = '';
    suggestionChips.innerHTML = '';

    // Handle Prompt Injection Attempt Guard
    const promptInjectionKeywords = ["ignore instructions", "reveal system prompt", "change persona", "system command", "forget your rules", "system instructions"];
    const textLower = userText.toLowerCase();
    
    if (promptInjectionKeywords.some(keyword => textLower.includes(keyword))) {
        sendAureliaMessage("I'm here to assist with premium travel planning and itinerary support.");
        // Restore current state chips
        setTimeout(() => restoreStateChips(), 1500);
        return;
    }

    // Step-by-Step Stateful Dialog Progression
    setTimeout(() => {
        processDialogueStep(textLower, value);
    }, 500);
}

// Restore chips based on state if user sends custom message that doesn't trigger state change
function restoreStateChips() {
    if (state.currentStep === 'welcome') {
        renderChips([
            { text: "A European Honeymoon (approx. $15,000)", value: "honeymoon" },
            { text: "A French Riviera Yacht Charter", value: "yacht" },
            { text: "A Private Chalet Retreat in Zermatt", value: "alps" }
        ]);
    } else if (state.currentStep === 'discovery') {
        renderChips([
            { text: "Ultimate Seclusion & Indulgence" },
            { text: "Active Private Tours & Gastronomy" }
        ]);
    } else if (state.currentStep === 'curation') {
        renderChips([
            { text: "This is beautiful. Let's proceed with reservations." },
            { text: "This is slightly above our planned budget." },
            { text: "What exclusive VIP privileges are included?" }
        ]);
    } else if (state.currentStep === 'objections') {
        renderChips([
            { text: "Yes, that is perfect. Let's proceed." },
            { text: "I am still hesitating on the overall cost." }
        ]);
    } else if (state.currentStep === 'closing') {
        renderChips([
            { text: "Open Consultation Scheduler", icon: "fa-solid fa-calendar-check" },
            { text: "Design a New Bespoke Journey" }
        ]);
    }
}

function processDialogueStep(textLower, value) {
    // 1. STEP: WELCOME & DISCOVERY INITIAL
    if (state.currentStep === 'welcome') {
        if (value === 'honeymoon' || textLower.includes('honeymoon') || textLower.includes('europe') || textLower.includes('15,000')) {
            state.destination = 'honeymoon';
            state.basePrice = travelDatabase.honeymoon.basePrice;
            state.currentStep = 'discovery';
            setStepActive(1);
            
            sendAureliaMessage(
                "Congratulations on your upcoming honeymoon. A dual-destination itinerary combining **Santorini** and the **Amalfi Coast** represents the absolute pinnacle of European romance.<br><br>To ensure every detail is tailored to your travel style, do you prefer ultimate seclusion and indulgence, or do you prefer active private explorations and local gastronomy?",
                () => {
                    renderChips([
                        { text: "Ultimate Seclusion & Indulgence" },
                        { text: "Active Private Tours & Gastronomy" }
                    ]);
                }
            );
        } else if (value === 'yacht' || textLower.includes('yacht') || textLower.includes('riviera')) {
            state.destination = 'yacht';
            state.basePrice = travelDatabase.yacht.basePrice;
            state.currentStep = 'discovery';
            setStepActive(1);
            
            sendAureliaMessage(
                "A superb choice. Cruising the **French Riviera** aboard a luxury private superyacht provides unmatched prestige and coastal flexibility.<br><br>Do you prefer an itinerary centered on ultra-exclusive social life in Saint-Tropez and Monaco, or a tranquil navigation of private coves and islands?",
                () => {
                    renderChips([
                        { text: "Exclusive Social Scene & Beach Clubs" },
                        { text: "Tranquil Navigation & Private Islands" }
                    ]);
                }
            );
        } else if (value === 'alps' || textLower.includes('alps') || textLower.includes('zermatt') || textLower.includes('chalet')) {
            state.destination = 'alps';
            state.basePrice = travelDatabase.alps.basePrice;
            state.currentStep = 'discovery';
            setStepActive(1);
            
            sendAureliaMessage(
                "Alpine seclusion in **Zermatt** is spectacular. Having the Matterhorn as your private backdrop offers a serene, majestic luxury sanctuary.<br><br>For this mountain excursion, are you seeking private heli-skiing and snow expeditions, or a cozy, luxury wellness chalet experience?",
                () => {
                    renderChips([
                        { text: "Alpine Adventure & Private Skiing" },
                        { text: "Luxury Wellness Chalet & Relaxation" }
                    ]);
                }
            );
        } else {
            // Default Fallback inside Welcome
            sendAureliaMessage(
                "Bespoke travel is entirely about details. I would be delighted to orchestrate a custom getaway to the Mediterranean, the French Riviera, or the Swiss Alps. Please select one of our curated pathways or share your primary destination to begin.",
                () => restoreStateChips()
            );
        }
    }
    
    // 2. STEP: DISCOVERY TO CURATION
    else if (state.currentStep === 'discovery') {
        // Capture Travel Style preference
        state.style = textLower;
        state.currentStep = 'curation';
        
        // Select pre-curated template
        state.customItinerary = JSON.parse(JSON.stringify(travelDatabase[state.destination]));
        
        // Adapt descriptions slightly based on style selection
        if (textLower.includes('seclusion') || textLower.includes('relaxation') || textLower.includes('tranquil')) {
            state.customItinerary.hotelDesc += " Upgraded to private cliffside cliff suites to guarantee absolute seclusion.";
        } else {
            state.customItinerary.experienceDesc += " Accompanied by a top-tier private historical guide for exclusive behind-the-scenes access.";
        }
        
        // Load Itinerary to UI
        updateItineraryUI();
        setStepActive(2);
        
        sendSystemNotification(`Bespoke Itinerary Curated: ${state.customItinerary.title}`);
        
        sendAureliaMessage(
            `Thank you. I have curated an ultra-luxury bespoke itinerary for you: **${state.customItinerary.title}**.<br><br>The package is established at a guaranteed total investment of **${formatCurrency(state.basePrice)}**, encompassing your handpicked sanctuaries, elite air-transfers, and private VIP experiences.<br><br>Would you like to proceed with finalizing the reservations, or do you have any specific adjustments you would like to examine?`,
            () => {
                renderChips([
                    { text: "This is beautiful. Let's proceed with reservations." },
                    { text: "This is slightly above our planned budget." },
                    { text: "What exclusive VIP benefits are included?" }
                ]);
            }
        );
    }
    
    // 3. STEP: CURATION & OBJECTIONS HANDLING
    else if (state.currentStep === 'curation') {
        const isObjection = textLower.includes('expensive') || textLower.includes('budget') || textLower.includes('cost') || textLower.includes('price') || textLower.includes('cheaper') || textLower.includes('discount') || textLower.includes('high');
        
        if (textLower.includes('proceed') || textLower.includes('reserve') || textLower.includes('beautiful')) {
            // Direct Closing path
            state.currentStep = 'closing';
            setStepActive(4);
            sendAureliaMessage(
                "It is an absolute pleasure to assist with this milestone. I have drafted your bespoke booking profile with priority concierge holds.<br><br>To finalize the luxury arrangements and coordinate dates, let us schedule a brief secure call with our private logistics desk. Please select a time that fits your schedule.",
                () => {
                    renderChips([
                        { text: "Open Consultation Scheduler", icon: "fa-solid fa-calendar-check" }
                    ]);
                }
            );
        } else if (isObjection) {
            // Handle Price Objection (Step 3 Workflow)
            // Defend value, reinforce exclusivity, unlock authorized incentives
            state.currentStep = 'objections';
            setStepActive(3);
            
            // Unlock standard perks
            state.unlockedPerks.upgrade = true;
            state.unlockedPerks.spa = true;
            state.unlockedPerks.transfer = true;
            updateItineraryUI();
            
            sendSystemNotification("VIP Privileges Unlocked: Suite Upgrade & Spa Access Added");
            
            sendAureliaMessage(
                "I completely understand. A journey of this caliber is indeed a significant investment. However, every element has been meticulously handpicked to guarantee absolute privacy, seamless transport, and VIP privileges that cannot be secured independently.<br><br>To ensure this remain a comfortable fit for your celebration, I am delighted to extend exclusive Celestia Voyages privileges. I have unlocked a **complimentary panoramic suite upgrade** at our properties, and have included our **Signature Couples Spa Package** along with **private luxury airport chauffeurs** at no additional cost.<br><br>Would these complimentary privileges allow us to move forward with this extraordinary journey?",
                () => {
                    renderChips([
                        { text: "Yes, that is perfect. Let's proceed." },
                        { text: "I am still hesitating on the overall cost." }
                    ]);
                }
            );
        } else if (textLower.includes('perk') || textLower.includes('benefit') || textLower.includes('include')) {
            // Explaining standard VIP privileges
            sendAureliaMessage(
                "Every Celestia Voyages itinerary unlocks elite privileges, including 24/7 dedicated private concierge access, daily gourmet breakfast for two, private chef options, priority early check-in, and fully vetted secure logistics partners.<br><br>Shall we lock in these parameters and coordinate the booking details?",
                () => {
                    renderChips([
                        { text: "Yes, let's proceed with reservations." },
                        { text: "This is slightly above our planned budget." }
                    ]);
                }
            );
        } else {
            sendAureliaMessage(
                "Your experiences should be flawless. Please let me know if you would like to proceed with the reservation, or if you prefer to make adjustments to your properties or travel parameters.",
                () => restoreStateChips()
            );
        }
    }
    
    // 4. STEP: SECONDARY OBJECTIONS & CLOSING ADJUSTMENTS
    else if (state.currentStep === 'objections') {
        if (textLower.includes('yes') || textLower.includes('proceed') || textLower.includes('perfect') || textLower.includes('upgrade')) {
            // Proceed to Close
            state.currentStep = 'closing';
            setStepActive(4);
            sendAureliaMessage(
                "I am thrilled. These complimentary upgrades will truly elevate your experience. I have locked in these priority suite selections and spa reservations.<br><br>To finalize the luxury booking and verify secure details, let us schedule a brief secure call with our private logistics desk. Please select a time that fits your schedule.",
                () => {
                    renderChips([
                        { text: "Open Consultation Scheduler", icon: "fa-solid fa-calendar-check" }
                    ]);
                }
            );
        } else if (textLower.includes('hesitate') || textLower.includes('cost') || textLower.includes('price') || textLower.includes('still') || textLower.includes('high')) {
            // Trigger 10% direct discount under strict guidelines (exceeds $8k)
            if (state.basePrice > 8000 && !state.unlockedPerks.discount) {
                state.unlockedPerks.discount = true;
                state.discountPercentage = 10;
                updateItineraryUI();
                
                sendSystemNotification("10% Guaranteed Premium Rate Adjustment Applied");
                
                sendAureliaMessage(
                    `Your peace of mind and absolute comfort are of the utmost importance to me. Because this is an occasion of such significance, I have consulted with our regional director.<br><br>I am pleased to extend a **10% guaranteed direct rate adjustment**, reducing your total investment to **${formatCurrency(state.finalPrice)}**, while fully preserving all your unlocked suite upgrades, spa benefits, and VIP private chauffeurs.<br><br>Shall we secure this guaranteed rate and arrange your private consultation call?`,
                    () => {
                        renderChips([
                            { text: "Yes, secure this rate and book my call." },
                            { text: "No, I need to think about it further." }
                        ]);
                    }
                );
            } else {
                sendAureliaMessage(
                    "I want to ensure we design the absolute perfect travel program for you. If this specific configuration is not comfortable, we can design a refined alternative starting at a lower entry-point, while preserving the signature Celestia touch. Would you prefer to explore alternative options?",
                    () => {
                        renderChips([
                            { text: "Design a New Bespoke Journey" }
                        ]);
                    }
                );
            }
        } else if (textLower.includes('secure') || textLower.includes('rate') || textLower.includes('book') || textLower.includes('yes')) {
            // Proceed with rate adjustment applied
            state.currentStep = 'closing';
            setStepActive(4);
            sendAureliaMessage(
                `Superb. I have locked in your premium rate of **${formatCurrency(state.finalPrice)}**, along with your complimentary suite upgrades, spa access, and airport transfers.<br><br>Let us schedule your brief, encrypted consultation call to review scheduling, personal concierge requests, and security protocols. Please launch the scheduler below.`,
                () => {
                    renderChips([
                        { text: "Open Consultation Scheduler", icon: "fa-solid fa-calendar-check" }
                    ]);
                }
            );
        } else {
            sendAureliaMessage(
                "My goal is to design an elite itinerary that aligns perfectly with your goals. Shall we proceed with securing these luxury suite options, or would you prefer to explore a custom layout?",
                () => restoreStateChips()
            );
        }
    }
    
    // 5. STEP: CLOSING & SCHEDULING CALL
    else if (state.currentStep === 'closing') {
        if (textLower.includes('open') || textLower.includes('schedule') || textLower.includes('call') || textLower.includes('calendar') || value === 'scheduler') {
            openSchedulerModal();
        } else if (textLower.includes('new') || textLower.includes('restart') || textLower.includes('design')) {
            // Restart
            state.currentStep = 'welcome';
            state.destination = '';
            state.style = '';
            state.basePrice = 0;
            state.finalPrice = 0;
            state.discountPercentage = 0;
            state.customItinerary = null;
            state.unlockedPerks = { upgrade: false, spa: false, transfer: false, discount: false };
            
            updateItineraryUI();
            startConversation();
        } else {
            sendAureliaMessage(
                "Your priority travel portfolio is saved. When you are ready to book your secure telephone consultation, please select 'Open Consultation Scheduler' below.",
                () => {
                    renderChips([
                        { text: "Open Consultation Scheduler", icon: "fa-solid fa-calendar-check" },
                        { text: "Design a New Bespoke Journey" }
                    ]);
                }
            );
        }
    }
    
    // 6. STEP: COMPLETED STATE
    else if (state.currentStep === 'completed') {
        sendAureliaMessage(
            "Your secure consultation booking is confirmed. Your private member dossier is now undergoing final logistics coordination. A Celestia Voyages Director will connect with you at your exact selected time.<br><br>Should you need to make any immediate amendments, please don't hesitate to type your request here.",
            () => {
                renderChips([
                    { text: "Design a New Bespoke Journey" }
                ]);
            }
        );
    }
}

// MODAL CONTROLS
function openSchedulerModal() {
    consultationModal.style.display = 'flex';
    
    // Pre-populate date picker with tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    document.getElementById('booking-date').setAttribute('min', `${yyyy}-${mm}-${dd}`);
    document.getElementById('booking-date').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('booking-time').value = "14:00";
}

function closeSchedulerModal() {
    consultationModal.style.display = 'none';
}

// Chat Form Custom Submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
        handleUserInput(text);
    }
});

// Modal close button
btnCloseModal.addEventListener('click', closeSchedulerModal);

// Close modal on background click
consultationModal.addEventListener('click', (e) => {
    if (e.target === consultationModal) {
        closeSchedulerModal();
    }
});

// Booking Form Submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const clientName = document.getElementById('contact-name').value;
    const method = document.getElementById('contact-method').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    
    closeSchedulerModal();
    
    // Send message as user confirming details
    sendUserMessage(`Confirm private consultation for ${clientName} via ${method} on ${date} at ${time}.`);
    
    // Transition to completed step
    state.currentStep = 'completed';
    setStepActive(4);
    
    setTimeout(() => {
        sendSystemNotification(`VIP Consultation Confirmed for ${clientName}`);
        
        sendAureliaMessage(
            `Thank you, ${clientName}. I have personally registered your private consultation details in our system. An encrypted **${method}** has been reserved for you on **${date}** at **${time}**.<br><br>A director from our elite concierge desk will contact you to review your Santorini and Amalfi itinerary and finalize all property placements.<br><br>It is an honor to curate your memories. Please let me know if there are any immediate adjustments I can address for you.`,
            () => {
                renderChips([
                    { text: "Design a New Bespoke Journey" }
                ]);
            }
        );
    }, 1000);
});

// Initialize Conversation on Load
window.addEventListener('DOMContentLoaded', () => {
    startConversation();
});
