import { useState } from 'react';
import { ShoppingBag, TrendingUp, Users, DollarSign, BarChart3, Plus, Edit, Share2, Mail, MessageSquare, Download } from 'lucide-react';

export function ECommercePanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([
    { id: 1, name: 'Premium Headphones', price: 299.99, stock: 45, sales: 127 },
    { id: 2, name: 'Wireless Mouse', price: 79.99, stock: 23, sales: 89 },
    { id: 3, name: 'Mechanical Keyboard', price: 149.99, stock: 67, sales: 203 },
  ]);

  const addNewProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: 'New Product',
      price: 0,
      stock: 0,
      sales: 0,
    };
    setProducts([...products, newProduct]);
  };

  const editProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newName = prompt('Enter product name:', product.name);
      const newPrice = prompt('Enter price:', product.price.toString());
      
      if (newName && newPrice) {
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, name: newName, price: parseFloat(newPrice) }
            : p
        ));
      }
    }
  };

  const promoteProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Simulate social media promotion
      alert(`Promoting ${product.name} on social media!`);
    }
  };

  const importCSV = () => {
    // Simulate CSV import
    const csvProducts = [
      { id: Date.now() + 1, name: 'Imported Product 1', price: 49.99, stock: 100, sales: 0 },
      { id: Date.now() + 2, name: 'Imported Product 2', price: 79.99, stock: 50, sales: 0 },
    ];
    setProducts([...products, ...csvProducts]);
  };

  const syncShopify = () => {
    alert('Syncing with Shopify store...');
  };

  const sendEmailCampaign = () => {
    alert('Email campaign sent to 1,247 customers!');
  };

  const sendSMSPromotion = () => {
    alert('SMS promotion sent to opted-in customers!');
  };

  const exportCustomerData = () => {
    // Create and download a sample CSV
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Orders\nJohn Doe,john@example.com,5\nJane Smith,jane@example.com,3";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Product Manager</h3>
            <button 
              onClick={addNewProduct}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg px-3 py-1 text-sm transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
            >
              <Plus className="w-3 h-3" />
              + Add Product
            </button>
          </div>
          
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-medium text-sm">{product.name}</div>
                    <div className="text-green-400 text-sm">${product.price}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">Stock: {product.stock}</div>
                    <div className="text-blue-400 text-xs">Sales: {product.sales}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => editProduct(product.id)}
                    className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded px-2 py-1 text-xs transition-all duration-300 shadow-lg shadow-blue-500/20"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => promoteProduct(product.id)}
                    className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded px-2 py-1 text-xs transition-all duration-300 shadow-lg shadow-purple-500/20"
                  >
                    <Share2 className="w-3 h-3" />
                    Promote
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 mt-4">
            <button 
              onClick={importCSV}
              className="text-left bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-orange-600/30 hover:shadow-lg hover:shadow-orange-500/20"
            >
              📤 Import CSV Products
            </button>
            <button 
              onClick={syncShopify}
              className="text-left bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/20"
            >
              🔗 Sync with Shopify
            </button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <h3 className="text-white font-medium">Sales Analytics</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-600/20 rounded-lg p-3 border border-green-600/30">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Revenue</span>
              </div>
              <div className="text-white font-bold text-lg">$12,847</div>
              <div className="text-green-400 text-xs">+23% this month</div>
            </div>
            
            <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-600/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm">Orders</span>
              </div>
              <div className="text-white font-bold text-lg">419</div>
              <div className="text-blue-400 text-xs">+18% this month</div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Top Products</h4>
            {products.slice(0, 2).map((product) => (
              <div key={product.id} className="flex justify-between items-center py-1">
                <span className="text-gray-300 text-sm">{product.name}</span>
                <span className="text-green-400 text-sm">{product.sales} sales</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-3">
          <h3 className="text-white font-medium">Customer Management</h3>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-white font-bold text-xl">1,247</div>
              <div className="text-gray-400 text-sm">Total Customers</div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={sendEmailCampaign}
              className="w-full text-left bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-purple-600/30 hover:shadow-lg hover:shadow-purple-500/20 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              📧 Send Email Campaign
            </button>
            <button 
              onClick={sendSMSPromotion}
              className="w-full text-left bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-green-600/30 hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              📱 Send SMS Promotion
            </button>
            <button 
              onClick={exportCustomerData}
              className="w-full text-left bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg px-3 py-2 text-sm transition-all duration-300 border border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              📊 Export Customer Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
