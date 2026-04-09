import { RatesAPI, BillingAPI } from '../api/api';

/**
 * Agni Commander - Acoustic Intelligence Engine
 * Handles Speech-to-Text command parsing and Text-to-Speech audio feedback.
 */
export const useVoiceCommander = (setActiveTab: (tab: string) => void) => {
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase();

    // 1. Navigation Commands
    if (cmd.includes('dashboard')) {
       setActiveTab('Dashboard');
       speak("Redirecting you to the Command Dashboard.");
    } else if (cmd.includes('inventory') || cmd.includes('stock')) {
       setActiveTab('Inventory/Tags');
       speak("Opening your Master Inventory.");
    } else if (cmd.includes('billing') || cmd.includes('invoice')) {
       setActiveTab('Billing');
       speak("Billing desk is ready.");
    } else if (cmd.includes('sales history')) {
       setActiveTab('Sales History');
       speak("Analyzing previous sales.");
    } else if (cmd.includes('rates') || cmd.includes('price')) {
       setActiveTab('Rates');
       speak("Reviewing today's gold and silver rates.");
    } else if (cmd.includes('vision') || cmd.includes('scan')) {
       setActiveTab('Agni Vision AI');
       speak("Activating AI Vision optics.");
    } else if (cmd.includes('customers')) {
       setActiveTab('Customers');
       speak("Accessing customer registry.");
    } else if (cmd.includes('reports')) {
       setActiveTab('Reports');
       speak("Generating executive reports.");
    }

    // 2. Intelligence Queries
    if (cmd.includes('gold rate today')) {
       try {
          const res = await RatesAPI.getLatest();
          const rate = res.data[0];
          speak(`Today's 22k gold rate is ${rate.gold_22k} rupees, and 24k is ${rate.gold_24k} rupees per gram.`);
       } catch {
          speak("I'm unable to fetch the rates at this moment.");
       }
    }

    if (cmd.includes('daily sales') || cmd.includes('today sales')) {
       try {
          const res = await BillingAPI.getAllSales();
          const today = new Date().toISOString().split('T')[0];
          const todaySales = res.data.filter((s: any) => s.sale_date.startsWith(today));
          const total = todaySales.reduce((acc: number, s: any) => acc + s.net_amount, 0);
          speak(`Today's total sales final tally is ${Math.round(total)} rupees across ${todaySales.length} transactions.`);
       } catch {
          speak("Error processing financial intelligence.");
       }
    }
  };

  return { speak, processCommand };
};
