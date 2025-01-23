document.addEventListener('DOMContentLoaded', function() {
    // Configuration and State Management
    const APP_CONFIG = {
        storageKey: 'tradingResearchData',
        dateFormat: new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    };

    // Theme Management
    class ThemeManager {
        constructor() {
            // Theme configuration
            this.themes = {
                light: {
                    '--primary-color': '#2c3e50',
                    '--secondary-color': '#3498db',
                    '--accent-color': '#2980b9',
                    '--background-color': '#f4f6f7',
                    '--text-color': '#2c3e50',
                    '--input-background': '#ffffff',
                    '--card-background': '#ffffff',
                    '--border-color': '#e0e0e0',
                    '--shadow-color': 'rgba(0,0,0,0.1)'
                },
                dark: {
                    '--primary-color': '#1a2634',
                    '--secondary-color': '#2c3e50',
                    '--accent-color': '#34495e',
                    '--background-color': '#121212',
                    '--text-color': '#e0e0e0',
                    '--input-background': '#1e1e1e',
                    '--card-background': '#1e2429',
                    '--border-color': '#333333',
                    '--shadow-color': 'rgba(255,255,255,0.05)'
                }
            };

            // Initialize theme
            this.currentTheme = this.loadTheme();
            this.applyTheme(this.currentTheme);
        }

        // Load theme from localStorage
        loadTheme() {
            return localStorage.getItem('trading-theme') || 'light';
        }

        // Save theme to localStorage
        saveTheme(theme) {
            localStorage.setItem('trading-theme', theme);
        }

        // Apply theme by updating CSS variables
        applyTheme(themeName) {
            const theme = this.themes[themeName];
            const root = document.documentElement;

            // Update CSS variables
            Object.entries(theme).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });

            // Update theme-specific styles
            document.body.classList.toggle('dark-theme', themeName === 'dark');
            
            // Update theme toggle button
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.textContent = themeName === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
            }

            // Optional: Adjust chart colors if Chart.js is used
            this.updateChartColors(themeName);
        }

        // Toggle between light and dark themes
        toggleTheme() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.currentTheme = newTheme;
            this.applyTheme(newTheme);
            this.saveTheme(newTheme);
        }

        // Update chart colors based on theme (if Chart.js is used)
        updateChartColors(themeName) {
            if (typeof Chart !== 'undefined' && this.sentimentChart) {
                const isDark = themeName === 'dark';
                this.sentimentChart.data.datasets[0].backgroundColor = isDark 
                    ? ['#4CAF50', '#F44336']  // Adjusted for dark mode
                    : ['#2ecc71', '#e74c3c']; // Original colors
                this.sentimentChart.options.title.fontColor = isDark ? '#e0e0e0' : '#2c3e50';
                this.sentimentChart.update();
            }
        }
    }

    // Data Management Class
    class TradingResearchManager {
        constructor() {
            this.data = this.loadData();
        }

        // Load data from localStorage
        loadData() {
            const savedData = localStorage.getItem(APP_CONFIG.storageKey);
            return savedData ? JSON.parse(savedData) : {
                observations: [],
                currentObservation: {}
            };
        }

        // Save data to localStorage
        saveData() {
            localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(this.data));
        }

        // Collect current observation data
        collectObservationData() {
            const observation = {
                timestamp: new Date().toISOString(),
                buyersResearch: this.collectSectionData('buyers-research'),
                economicOutlook: this.collectSectionData('economic-outlook'),
                marketSentiments: this.collectSectionData('market-sentiments'),
                tradingObservations: this.collectSectionData('observations')
            };

            this.data.observations.push(observation);
            this.data.currentObservation = observation;
            this.saveData();

            return observation;
        }

        // Helper method to collect data from a specific section
        collectSectionData(sectionId) {
            const section = document.getElementById(sectionId);
            const formData = {};

            // Collect input values
            section.querySelectorAll('input, textarea, select').forEach(element => {
                const key = element.id || element.name;
                
                if (element.type === 'checkbox') {
                    // For checkboxes, collect checked values
                    if (!formData[key]) formData[key] = [];
                    if (element.checked) formData[key].push(element.value);
                } else if (element.type === 'radio') {
                    // For radio buttons, collect selected value
                    if (element.checked) formData[key] = element.value;
                } else {
                    formData[key] = element.value;
                }
            });

            return formData;
        }

        // Generate daily report
        generateDailyReport() {
            const latestObservation = this.data.currentObservation;
            if (!latestObservation) {
                alert('No observations to generate report for.');
                return null;
            }

            return this.formatReport(latestObservation);
        }

        // Format report as structured text
        formatReport(observation) {
            return `
DAILY TRADING RESEARCH REPORT
Date: ${APP_CONFIG.dateFormat.format(new Date(observation.timestamp))}

1. BUYERS' RESEARCH
Economic Outlook: ${observation.buyersResearch['economic-outlook'] || 'N/A'}
Inflation Rate: ${observation.buyersResearch['inflation-rate'] || 'N/A'}
Fed Decision Analysis: ${observation.buyersResearch['fed-decision'] || 'N/A'}

2. ECONOMIC OUTLOOK
Economy Status: ${observation.economicOutlook['economy-status'] || 'N/A'}
Inflation Trend: ${observation.economicOutlook['inflation-trend'] || 'N/A'}
GDP Growth: ${observation.economicOutlook['gdp-growth'] || 'N/A'}

3. MARKET SENTIMENTS
Bullish Traders: ${observation.marketSentiments['bullish-percentage'] || 'N/A'}%
Bearish Traders: ${observation.marketSentiments['bearish-percentage'] || 'N/A'}%
Resistance Level: ${observation.marketSentiments['resistance-level'] || 'N/A'}
Support Level: ${observation.marketSentiments['support-level'] || 'N/A'}

4. TRADING OBSERVATIONS
Chosen Bias: ${observation.tradingObservations['chosen-bias'] || 'N/A'}
Activation Price: ${observation.tradingObservations['activation-price'] || 'N/A'}
Target Price: ${observation.tradingObservations['target-price'] || 'N/A'}
Stop Loss: ${observation.tradingObservations['stop-loss'] || 'N/A'}
            `;
        }

        // Export report to different formats
        exportReport(format = 'text') {
            const report = this.generateDailyReport();
            if (!report) return;

            switch(format) {
                case 'text':
                    this.downloadTextFile('daily_trading_report.txt', report);
                    break;
                case 'pdf':
                    this.downloadReportAsPDF(report);
                    break;
            }
        }

        // Download text file
        downloadTextFile(filename, text) {
            const blob = new Blob([text], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }

        // PDF Download Functionality
        downloadReportAsPDF(report) {
            // Use jsPDF for PDF generation
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Set document properties
            doc.setProperties({
                title: 'Daily Trading Research Report',
                author: 'Trading Research Dashboard'
            });

            // Styling
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');

            // Add report title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Daily Trading Research Report', 105, 20, { align: 'center' });

            // Add date
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

            // Split report text into lines that fit the page
            const splitText = doc.splitTextToSize(report, 170);

            // Add report content
            doc.setFontSize(10);
            doc.text(splitText, 20, 50);

            // Add footer
            doc.setFontSize(8);
            doc.text(' Inoxoft Systems 2025 | Not Financial Advice', 105, 287, { align: 'center' });

            // Save the PDF
            const fileName = `Daily_Trading_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        }
    }

    // Market Sentiment Visualization
    class SentimentVisualizer {
        constructor(chartContainerId, themeManager) {
            this.container = document.getElementById(chartContainerId);
            this.themeManager = themeManager;
            this.chart = null;
        }

        // Create sentiment pie chart
        updateSentimentChart() {
            // Clear previous chart
            this.container.innerHTML = '';

            // Collect sentiment data
            const bullishPercentage = parseFloat(document.getElementById('bullish-percentage').value) || 0;
            const bearishPercentage = parseFloat(document.getElementById('bearish-percentage').value) || 0;

            // Create canvas
            const canvas = document.createElement('canvas');
            this.container.appendChild(canvas);

            // Check if Chart.js is available
            if (typeof Chart !== 'undefined') {
                const isDark = this.themeManager.currentTheme === 'dark';
                this.chart = new Chart(canvas, {
                    type: 'pie',
                    data: {
                        labels: ['Bullish', 'Bearish'],
                        datasets: [{
                            data: [bullishPercentage, bearishPercentage],
                            backgroundColor: isDark 
                                ? ['#4CAF50', '#F44336']  // Dark mode colors
                                : ['#2ecc71', '#e74c3c']  // Light mode colors
                        }]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Market Sentiment',
                            fontColor: isDark ? '#e0e0e0' : '#2c3e50'
                        },
                        legend: {
                            labels: {
                                fontColor: isDark ? '#e0e0e0' : '#2c3e50'
                            }
                        }
                    }
                });

                // Store reference for theme updates
                this.themeManager.sentimentChart = this.chart;
            }
        }
    }

    // Initialize theme management
    const themeManager = new ThemeManager();

    // Initialize core functionality
    const researchManager = new TradingResearchManager();
    const sentimentVisualizer = new SentimentVisualizer('sentiment-chart', themeManager);

    // Add theme toggle button to the page
    function createThemeToggleButton() {
        const button = document.createElement('button');
        button.id = 'theme-toggle';
        button.textContent = themeManager.currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
        button.classList.add('theme-toggle-btn');
        
        // Position the button (you may want to adjust this)
        button.style.position = 'fixed';
        button.style.top = '20px';
        button.style.right = '20px';
        button.style.zIndex = '1000';

        button.addEventListener('click', () => {
            themeManager.toggleTheme();
        });

        document.body.appendChild(button);
    }

    // Event Listeners
    document.getElementById('save-observations').addEventListener('click', () => {
        researchManager.collectObservationData();
        alert('Observations saved successfully!');
    });

    // Method to create report modal with preview and download options
    function createReportModal(report) {
        const reportModal = document.createElement('div');
        reportModal.classList.add('report-modal');
        reportModal.innerHTML = `
            <div class="report-modal-content">
                <span class="close-modal">&times;</span>
                <h2>Daily Trading Research Report Preview</h2>
                <div class="report-preview-container">
                    <pre id="report-preview">${report}</pre>
                </div>
                <div class="report-actions">
                    <button id="copy-report">Copy Report</button>
                    <button id="download-pdf-report">Download PDF</button>
                </div>
            </div>
        `;
        document.body.appendChild(reportModal);

        // Close modal functionality
        const closeModal = reportModal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(reportModal);
        });

        // Copy report functionality
        const copyReportBtn = reportModal.querySelector('#copy-report');
        copyReportBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(report).then(() => {
                copyReportBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyReportBtn.textContent = 'Copy Report';
                }, 2000);
            });
        });

        // PDF Download functionality
        const downloadPdfBtn = reportModal.querySelector('#download-pdf-report');
        downloadPdfBtn.addEventListener('click', () => {
            researchManager.downloadReportAsPDF(report);
        });
    }

    // Add event listeners for Daily Report buttons
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            const report = researchManager.generateDailyReport();
            if (report) {
                createReportModal(report);
            } else {
                alert('No observations available to generate report.');
            }
        });
    }

    // Update sentiment chart on input changes
    ['bullish-percentage', 'bearish-percentage'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            sentimentVisualizer.updateSentimentChart();
        });
    });

    // Create theme toggle button
    createThemeToggleButton();

    // Optional: Initial chart render
    sentimentVisualizer.updateSentimentChart();

    // Header Scroll Effect
    function initHeaderScrollEffect() {
        const header = document.querySelector('header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Initialize header scroll effect
    initHeaderScrollEffect();
});