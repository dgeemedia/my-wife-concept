// frontend/components/admin/tabs/ProductsTab.js
import { formatCurrency } from '../../../lib/currency';

export default function ProductsTab({
  products,
  newProduct,
  editingProduct,
  uploadingImage,
  settings,
  setNewProduct,
  setEditingProduct,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleImageUpload
}) {
  return (
    <div className="products-section">
      <div className="section-header">
        <h2>🍽️ Products Management</h2>
        <button onClick={() => setEditingProduct({})} className="btn-primary">
          + Add New Product
        </button>
      </div>

      {/* Add/Edit Product Form */}
      {(editingProduct !== null) && (
        <div className="product-form-card">
          <h3>{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={editingProduct.id ? handleUpdateProduct : handleCreateProduct}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Product Name *"
                value={editingProduct.name || newProduct.name}
                onChange={(e) => editingProduct.id 
                  ? setEditingProduct({...editingProduct, name: e.target.value})
                  : setNewProduct({...newProduct, name: e.target.value})
                }
                required
              />
              <input
                type="number"
                placeholder="Price *"
                step="0.01"
                value={editingProduct.price || newProduct.price}
                onChange={(e) => editingProduct.id 
                  ? setEditingProduct({...editingProduct, price: e.target.value})
                  : setNewProduct({...newProduct, price: e.target.value})
                }
                required
              />
              <input
                type="number"
                placeholder="Stock *"
                value={editingProduct.stock || newProduct.stock}
                onChange={(e) => editingProduct.id 
                  ? setEditingProduct({...editingProduct, stock: e.target.value})
                  : setNewProduct({...newProduct, stock: e.target.value})
                }
                required
              />
              <input
                type="text"
                placeholder="Image URL (or upload below)"
                value={editingProduct.imageUrl || newProduct.imageUrl}
                onChange={(e) => editingProduct.id 
                  ? setEditingProduct({...editingProduct, imageUrl: e.target.value})
                  : setNewProduct({...newProduct, imageUrl: e.target.value})
                }
              />
            </div>
            <textarea
              placeholder="Description"
              rows={3}
              value={editingProduct.description || newProduct.description}
              onChange={(e) => editingProduct.id 
                ? setEditingProduct({...editingProduct, description: e.target.value})
                : setNewProduct({...newProduct, description: e.target.value})
              }
            />
            <div className="image-upload">
              <label>
                {uploadingImage ? 'Uploading...' : '📷 Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, !!editingProduct.id)}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>
              {(editingProduct.imageUrl || newProduct.imageUrl) && (
                <img 
                  src={editingProduct.imageUrl || newProduct.imageUrl} 
                  alt="Preview" 
                  className="image-preview"
                />
              )}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingProduct.id ? 'Update Product' : 'Create Product'}
              </button>
              {editingProduct.id && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({ name: '', price: '', stock: '', description: '', imageUrl: '' });
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="products-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Add your first product!</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
              )}
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">{formatCurrency(product.price, settings.currency)}</p>
                <p className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
                  Stock: {product.stock}
                </p>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
              </div>
              <div className="product-actions">
                <button onClick={() => setEditingProduct(product)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}