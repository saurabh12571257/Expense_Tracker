import { useState, useEffect } from 'react'
import Login from './Login'
import Register from './Register'

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [_userEmail, setUserEmail] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [token, setToken] = useState('');
  const [_isLoading, setIsLoading] = useState(false);
  
  // Reset data to zero values
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [editBalanceValue, setEditBalanceValue] = useState('');
  const [editIncomeValue, setEditIncomeValue] = useState('');
  
  // Add savings goal state
  const [savingsGoal, setSavingsGoal] = useState(1000);
  const [isEditSavingsGoalModalOpen, setIsEditSavingsGoalModalOpen] = useState(false);
  const [editSavingsGoalValue, setEditSavingsGoalValue] = useState('');
  
  // Add user state for profile
  const [user, setUser] = useState({
    name: 'John Doe',
    initials: 'JD',
    profileColor: 'bg-indigo-700'
  });
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });
  // Empty recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Initial empty categories
  const [categories, setCategories] = useState([]);

  // Category colors mapping
  const categoryColors = {
    'Housing': 'bg-blue-500',
    'Food': 'bg-green-500',
    'Transportation': 'bg-yellow-500',
    'Entertainment': 'bg-purple-500',
    'Others': 'bg-red-500'
  };

  // Available expense categories for dropdown
  const availableCategories = [
    'Housing',
    'Food',
    'Transportation',
    'Entertainment',
    'Others'
  ];

  const updateCategoriesFromTransactions = () => {
    // Filter out income transactions
    const expenseTransactions = recentTransactions.filter(transaction => transaction.amount < 0);
    
    // Calculate total expenses
    const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    
    // Group expenses by category
    const categoryMap = {};
    expenseTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += Math.abs(transaction.amount);
    });
    
    // Convert to array of category objects
    const updatedCategories = Object.keys(categoryMap).map(name => ({
      name,
      amount: categoryMap[name],
      percentage: totalExpenses ? (categoryMap[name] / totalExpenses) * 100 : 0
    }));
    
    // Sort by amount (highest first)
    updatedCategories.sort((a, b) => b.amount - a.amount);
    
    setCategories(updatedCategories);
  };

  // Update categories whenever transactions change
  useEffect(() => {
    updateCategoriesFromTransactions();
  }, [recentTransactions, updateCategoriesFromTransactions]);

  // Check for existing token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    }
  }, []);

  // Fetch user data from the backend
  const fetchUserData = async (authToken) => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const profileResponse = await fetch('http://localhost:5002/api/profile', {
        headers: {
          'x-auth-token': authToken
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // Extract user email and other profile information
        const userData = profileData.user || {};
        setUserEmail(userData.email || '');
        
        // Extract initials from email
        const emailName = userData.email ? userData.email.split('@')[0] : '';
        const initials = emailName.substring(0, 2).toUpperCase();
        
        setUser({
          name: emailName,
          initials: initials,
          profileColor: 'bg-indigo-700'
        });
        
        setIsAuthenticated(true);
      }
      
      // Fetch user transactions
      const transactionsResponse = await fetch('http://localhost:5002/api/transactions', {
        headers: {
          'x-auth-token': authToken
        }
      });
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        if (transactionsData.transactions) {
          setRecentTransactions(transactionsData.transactions);
          
          // Calculate balance, income, and expenses from transactions
          let totalIncome = 0;
          let totalExpenses = 0;
          
          transactionsData.transactions.forEach(transaction => {
            if (transaction.amount > 0) {
              totalIncome += transaction.amount;
            } else {
              totalExpenses += Math.abs(transaction.amount);
            }
          });
          
          setIncome(totalIncome);
          setExpenses(totalExpenses);
          setBalance(totalIncome - totalExpenses);
        }
      }
      
      // Fetch user's savings goal
      const accountsResponse = await fetch('http://localhost:5002/api/accounts', {
        headers: {
          'x-auth-token': authToken
        }
      });
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        if (accountsData.accounts && accountsData.accounts.length > 0) {
          // Assuming the first account has the savings goal
          setSavingsGoal(accountsData.accounts[0].savings_goal || 1000);
        }
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTransaction({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      return;
    }
    
    // Convert amount to number and make it positive (the type field will determine if it's income or expense)
    const amount = Math.abs(parseFloat(newTransaction.amount));
    
    try {
      const response = await fetch('http://localhost:5002/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          description: newTransaction.description,
          amount: newTransaction.type === 'expense' ? -amount : amount,
          category: newTransaction.category,
          date: newTransaction.date,
          type: newTransaction.type
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add the new transaction to the state
        const updatedTransactions = [data.transaction, ...recentTransactions];
        setRecentTransactions(updatedTransactions);
        
        // Update balance, income, and expenses
        if (data.transaction.amount > 0) {
          setIncome(income + data.transaction.amount);
          setBalance(balance + data.transaction.amount);
        } else {
          setExpenses(expenses + Math.abs(data.transaction.amount));
          setBalance(balance + data.transaction.amount); // amount is negative for expenses
        }
        
        // Reset the form
        setNewTransaction({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense'
        });
        
        // Close the modal
        setIsModalOpen(false);
      } else {
        console.error('Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleOpenEditBalanceModal = () => {
    setEditBalanceValue(balance.toFixed(2));
    setIsEditBalanceModalOpen(true);
  };

  const handleCloseEditBalanceModal = () => {
    setIsEditBalanceModalOpen(false);
  };

  const handleOpenEditIncomeModal = () => {
    setEditIncomeValue(income.toFixed(2));
    setIsEditIncomeModalOpen(true);
  };

  const handleCloseEditIncomeModal = () => {
    setIsEditIncomeModalOpen(false);
  };

  const handleEditBalance = () => {
    const newBalance = parseFloat(editBalanceValue);
    if (isNaN(newBalance)) {
      alert('Please enter a valid number');
      return;
    }
    setBalance(newBalance);
    handleCloseEditBalanceModal();
  };

  const handleEditIncome = () => {
    const newIncome = parseFloat(editIncomeValue);
    if (isNaN(newIncome)) {
      alert('Please enter a valid number');
      return;
    }
    
    // Calculate the difference to update the balance
    const difference = newIncome - income;
    
    // Update income and balance
    setIncome(newIncome);
    setBalance(prevBalance => prevBalance + difference);
    
    handleCloseEditIncomeModal();
  };

  // Add handlers for savings goal
  const handleOpenEditSavingsGoalModal = () => {
    setEditSavingsGoalValue(savingsGoal.toFixed(2));
    setIsEditSavingsGoalModalOpen(true);
  };

  const handleCloseEditSavingsGoalModal = () => {
    setIsEditSavingsGoalModalOpen(false);
  };

  const handleEditSavingsGoal = async () => {
    if (!editSavingsGoalValue) {
      return;
    }
    
    const newSavingsGoal = parseFloat(editSavingsGoalValue);
    
    try {
      // Get the first account (assuming it's the primary account)
      const accountsResponse = await fetch('http://localhost:5002/api/accounts', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        if (accountsData.accounts && accountsData.accounts.length > 0) {
          const accountId = accountsData.accounts[0].id;
          
          // Update the savings goal
          const response = await fetch(`http://localhost:5002/api/accounts/${accountId}/savings-goal`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({
              savings_goal: newSavingsGoal
            })
          });
          
          if (response.ok) {
            setSavingsGoal(newSavingsGoal);
            setIsEditSavingsGoalModalOpen(false);
            setEditSavingsGoalValue('');
          }
        }
      }
    } catch (error) {
      console.error('Error updating savings goal:', error);
    }
  };

  // Calculate savings progress
  const calculateSavingsProgress = () => {
    const progress = (balance / savingsGoal) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
  };

  // Handle login
  const handleLogin = (userData) => {
    const authToken = localStorage.getItem('token');
    setToken(authToken);
    
    if (authToken) {
      fetchUserData(authToken);
    } else {
      // Fallback if token is not available
      setIsAuthenticated(true);
      setUserEmail(userData.email);
      
      // Extract initials from email
      const emailName = userData.email.split('@')[0];
      const initials = emailName.substring(0, 2).toUpperCase();
      
      setUser({
        ...user,
        name: emailName,
        initials: initials
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setToken('');
    localStorage.removeItem('token');
    
    // Reset user data
    setBalance(0);
    setIncome(0);
    setExpenses(0);
    setRecentTransactions([]);
    setSavingsGoal(1000);
  };

  // Handle register
  const handleRegister = (userData) => {
    if (userData) {
      // If userData is provided, it means registration was successful
      // Automatically log in the user
      handleLogin(userData);
    } else {
      // If userData is null, it means the user clicked "Sign in" on the register page
      setShowRegister(false);
    }
  };

  // Handle register click from login page
  const handleRegisterClick = () => {
    setShowRegister(true);
  };

  // If not authenticated, show login or register screen
  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onRegister={handleRegister} />;
    } else {
      return <Login onLogin={handleLogin} onRegisterClick={handleRegisterClick} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Profile Button */}
              <button className="flex items-center justify-center w-10 h-10 rounded-full text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" 
                style={{ backgroundColor: '#4f46e5' }}>
                {user.initials}
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                onClick={handleOpenModal}
              >
                Add Transaction
              </button>
              {/* Logout Button */}
              <button 
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Transaction</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={newTransaction.type === 'expense'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Expense</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={newTransaction.type === 'income'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Income</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="What was this transaction for?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {newTransaction.type === 'income' ? (
                    <option value="Income">Income</option>
                  ) : (
                    availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleAddTransaction}
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {isEditBalanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Current Balance</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseEditBalanceModal}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance Amount</label>
                <input
                  type="number"
                  value={editBalanceValue}
                  onChange={(e) => setEditBalanceValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleCloseEditBalanceModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleEditBalance}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Income Modal */}
      {isEditIncomeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Total Income</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseEditIncomeModal}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Income Amount</label>
                <input
                  type="number"
                  value={editIncomeValue}
                  onChange={(e) => setEditIncomeValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleCloseEditIncomeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleEditIncome}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Savings Goal Modal */}
      {isEditSavingsGoalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Savings Goal</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseEditSavingsGoalModal}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Savings Goal Amount</label>
                <input
                  type="number"
                  value={editSavingsGoalValue}
                  onChange={(e) => setEditSavingsGoalValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleCloseEditSavingsGoalModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleEditSavingsGoal}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-500">Current Balance</h2>
              <button 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                onClick={handleOpenEditBalanceModal}
              >
                Edit
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">₹{balance.toFixed(2)}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="flex items-center text-green-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z" clipRule="evenodd" />
                </svg>
                Updated today
              </span>
            </div>
          </div>

          {/* Income Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-500">Total Income</h2>
              <button 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                onClick={handleOpenEditIncomeModal}
              >
                Edit
              </button>
            </div>
            <p className="text-3xl font-bold text-green-600 mt-2">₹{income.toFixed(2)}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="flex items-center text-green-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z" clipRule="evenodd" />
                </svg>
                This month
              </span>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-500">Total Expenses</h2>
            <p className="text-3xl font-bold text-red-600 mt-2">₹{expenses.toFixed(2)}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="flex items-center text-red-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                This month
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
            <div className="space-y-4">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">₹{category.amount.toFixed(2)} ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`${category.color} h-2.5 rounded-full`} style={{ width: `${category.percentage}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No expense data yet. Add transactions to see your expense breakdown.
                </div>
              )}
            </div>
      </div>

          {/* Savings Goal Tracker */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Savings Goal Tracker</h2>
              <button 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                onClick={handleOpenEditSavingsGoalModal}
              >
                Edit Goal
        </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Current Balance</span>
                <span className="text-sm font-medium text-gray-900">₹{balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Goal</span>
                <span className="text-sm font-medium text-gray-900">₹{savingsGoal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Remaining</span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{Math.max(savingsGoal - balance, 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculateSavingsProgress().toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${calculateSavingsProgress()}%` }}
                ></div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                {balance >= savingsGoal ? (
                  <span className="text-green-600 font-medium">You are in the range of your savings goal!</span>
                ) : (
                  <span>Keep going! You're making progress toward your goal.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions yet. Add some transactions to get started.
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
  )
}

export default App
