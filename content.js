console.log("🚀 Cognitive Load Monitor - LOADED SUCCESSFULLY!");

// Simple test to verify it's working
if (window.location.href.includes('cliq.zoho.com')) {
    console.log("✅ Zoho Cliq detected!");
    
    // Create visible success indicator
    const successDiv = document.createElement('div');
    successDiv.innerHTML = '🎉 EXTENSION WORKING!';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 5000);
}