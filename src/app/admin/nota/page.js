'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import AdminProtect from '../../../../components/AdminProtect';
import './nota.css';

function NotaContent() {
  const [tanggal, setTanggal] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  const [items, setItems] = useState([
    { 
      biji: 1, 
      productId: null,
      namaBarang: '', 
      kadar: '', 
      berat: '', 
      modelKode: '', 
      hargaPerGram: '', // Input manual harga per gram
      jumlah: 0, 
      photo: null,
      productSearch: '',
      showProductDropdown: false,
      productResults: []
    }
  ]);
  
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [terbilang, setTerbilang] = useState('');
  const [goldPrices, setGoldPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const customerInputRef = useRef(null);
  const productInputRefs = useRef({});

  // Add Bootstrap CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Fetch gold prices on mount
  useEffect(() => {
    fetchGoldPrices();
  }, []);

  // Set default date
  useEffect(() => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    setTanggal(dateString);
  }, []);

  // Fetch gold prices
  const fetchGoldPrices = async () => {
    try {
      const response = await fetch('/api/gold-prices');
      const data = await response.json();
      if (data.success) {
        const priceMap = {};
        data.data.forEach(gp => {
          priceMap[gp.code] = gp.sellPrice; // Gunakan sellPrice untuk nota
        });
        setGoldPrices(priceMap);
      }
    } catch (error) {
      console.error('Error fetching gold prices:', error);
    }
  };

  // Search customers
  const searchCustomers = async (query) => {
    if (!query || query.length < 2) {
      setCustomerResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setCustomerResults(data.data);
        setShowCustomerDropdown(true);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  // Handle customer search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSearch) {
        searchCustomers(customerSearch);
      } else {
        setCustomerResults([]);
        setShowCustomerDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Select customer
  const selectCustomer = (customer) => {
    setCustomerId(customer._id);
    setNama(customer.nama);
    setAlamat(customer.alamat);
    setCustomerSearch(customer.nama + (customer.NIK ? ` (${customer.NIK})` : ''));
    setShowCustomerDropdown(false);
  };

  // Search products
  const searchProducts = async (query, itemIndex) => {
    if (!query || query.length < 2) {
      const newItems = [...items];
      newItems[itemIndex].productResults = [];
      newItems[itemIndex].showProductDropdown = false;
      setItems(newItems);
      return;
    }

    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      if (data.success) {
        const newItems = [...items];
        newItems[itemIndex].productResults = data.data;
        newItems[itemIndex].showProductDropdown = true;
        setItems(newItems);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  // Handle product search input
  const handleProductSearch = (index, value) => {
    const newItems = [...items];
    newItems[index].productSearch = value;
    setItems(newItems);

    const timer = setTimeout(() => {
      if (value) {
        searchProducts(value, index);
      } else {
        newItems[index].productResults = [];
        newItems[index].showProductDropdown = false;
        setItems(newItems);
      }
    }, 300);

    return () => clearTimeout(timer);
  };

  // Select product
  const selectProduct = (product, itemIndex) => {
    // Validasi kadarK harus ada
    if (!product.kadarK || product.kadarK.trim() === '') {
      alert(`Produk "${product.name}" tidak memiliki kadar emas (kadarK). Silakan lengkapi data produk terlebih dahulu di halaman Admin > Products.`);
      return;
    }
    
    const newItems = [...items];
    const item = newItems[itemIndex];
    
    item.productId = product._id;
    item.namaBarang = product.name;
    item.kadar = product.kadarK.trim(); // Ambil kadarK dari product (READ-ONLY), pastikan tidak kosong
    // Berat TIDAK diisi otomatis, harus input manual
    if (!item.berat) {
      item.berat = ''; // Kosongkan agar user input manual
    }
    item.modelKode = product.code; // +6, X, atau XX
    
    // Set default harga per gram dari goldPrices, tapi bisa diubah manual
    if (!item.hargaPerGram && goldPrices[product.code]) {
      item.hargaPerGram = goldPrices[product.code].toString();
    }
    
    // Hitung jumlah jika berat dan harga per gram sudah diisi: berat × harga per gram × biji
    if (item.berat && item.hargaPerGram) {
      const berat = item.berat === '' ? 0 : parseFloat(item.berat) || 0;
      const hargaPerGram = item.hargaPerGram === '' ? 0 : parseFloat(item.hargaPerGram) || 0;
      const biji = parseInt(item.biji) || 1;
      if (berat > 0 && hargaPerGram > 0) {
        item.jumlah = berat * hargaPerGram * biji;
      } else {
        item.jumlah = 0;
      }
    } else {
      item.jumlah = 0;
    }
    
    item.productSearch = product.name;
    item.showProductDropdown = false;
    item.productResults = [];
    
    setItems(newItems);
  };

  // Helper functions
  const angkaTerbilang = (angka) => {
    const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    
    if (angka < 12) {
      return satuan[angka];
    } else if (angka < 20) {
      return satuan[angka - 10] + ' belas';
    } else if (angka < 100) {
      const puluhan = Math.floor(angka / 10);
      const sisa = angka % 10;
      return satuan[puluhan] + ' puluh ' + satuan[sisa];
    } else if (angka < 200) {
      return 'seratus ' + angkaTerbilang(angka - 100);
    } else if (angka < 1000) {
      const ratusan = Math.floor(angka / 100);
      const sisa = angka % 100;
      return satuan[ratusan] + ' ratus ' + angkaTerbilang(sisa);
    } else if (angka < 2000) {
      return 'seribu ' + angkaTerbilang(angka - 1000);
    } else if (angka < 1000000) {
      const ribuan = Math.floor(angka / 1000);
      const sisa = angka % 1000;
      return angkaTerbilang(ribuan) + ' ribu ' + angkaTerbilang(sisa);
    } else if (angka < 1000000000) {
      const jutaan = Math.floor(angka / 1000000);
      const sisa = angka % 1000000;
      return angkaTerbilang(jutaan) + ' juta ' + angkaTerbilang(sisa);
    } else if (angka < 1000000000000) {
      const milyaran = Math.floor(angka / 1000000000);
      const sisa = angka % 1000000000;
      return angkaTerbilang(milyaran) + ' milyar ' + angkaTerbilang(sisa);
    } else if (angka < 1000000000000000) {
      const triliunan = Math.floor(angka / 1000000000000);
      const sisa = angka % 1000000000000;
      return angkaTerbilang(triliunan) + ' triliun ' + angkaTerbilang(sisa);
    }
    
    return 'Angka terlalu besar';
  };

  // Update total and terbilang when items change
  useEffect(() => {
    let total = 0;
    items.forEach(item => {
      if (item.productId && item.berat && item.hargaPerGram) {
        const berat = item.berat === '' ? 0 : parseFloat(item.berat) || 0;
        const biji = parseInt(item.biji) || 1;
        const hargaPerGram = item.hargaPerGram === '' ? 0 : parseFloat(item.hargaPerGram) || 0;
        if (berat > 0 && hargaPerGram > 0) {
          total += berat * hargaPerGram * biji;
        }
      }
    });
    setTotalAmount(total);
    setTerbilang(angkaTerbilang(Math.round(total)));
  }, [items]);

  const addItemRow = () => {
    setItems([...items, { 
      biji: items.length + 1, 
      productId: null,
      namaBarang: '', 
      kadar: '', 
      berat: '', 
      modelKode: '', 
      hargaPerGram: '',
      jumlah: 0,
      photo: null,
      productSearch: '',
      showProductDropdown: false,
      productResults: []
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];
    
    // Handle empty string untuk number fields
    if ((field === 'berat' || field === 'hargaPerGram') && value === '') {
      item[field] = '';
      item.jumlah = 0;
      setItems(newItems);
      return;
    }
    
    // Handle empty string untuk biji
    if (field === 'biji') {
      if (value === '' || value === null || value === undefined) {
        item[field] = 1; // Default to 1 jika kosong
      } else {
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        item[field] = (numValue < 1 || isNaN(numValue)) ? 1 : numValue;
      }
    } else {
      item[field] = value;
    }
    
    // Recalculate jumlah if biji, berat, or hargaPerGram changes
    if ((field === 'biji' || field === 'berat' || field === 'hargaPerGram') && item.productId) {
      const berat = item.berat === '' ? 0 : parseFloat(item.berat) || 0;
      const biji = parseInt(item.biji) || 1;
      const hargaPerGram = item.hargaPerGram === '' ? 0 : parseFloat(item.hargaPerGram) || 0;
      
      if (berat > 0 && hargaPerGram > 0 && biji >= 1) {
        item.jumlah = berat * hargaPerGram * biji;
      } else {
        item.jumlah = 0;
      }
    }
    
    setItems(newItems);
  };

  // Create new customer
  const createNewCustomer = async () => {
    if (!nama || !alamat) {
      alert('Nama dan alamat harus diisi untuk membuat customer baru');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          alamat,
          NIK: customerSearch.match(/\((\d+)\)/)?.[1] || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCustomerId(data.data._id);
        alert('Customer baru berhasil dibuat');
      } else {
        alert(data.error || 'Gagal membuat customer baru');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Terjadi kesalahan saat membuat customer baru');
    } finally {
      setLoading(false);
    }
  };

  // Save nota
  const saveNota = async () => {
    if (!tanggal || !customerId || !nama || !alamat) {
      alert('Data customer belum lengkap');
      return;
    }

    if (items.length === 0 || !items.some(item => item.productId)) {
      alert('Minimal harus ada satu item produk');
      return;
    }

    // Validasi berat dan harga per gram harus diisi
    const itemsWithMissingData = items.filter(item => 
      item.productId && (!item.berat || !item.hargaPerGram)
    );
    if (itemsWithMissingData.length > 0) {
      alert('Berat dan harga per gram harus diisi untuk semua item produk');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/nota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal,
          customerId,
          nama,
          alamat,
          items: items
              .filter(item => item.productId && item.berat && item.hargaPerGram)
              .map(item => ({
                productId: item.productId,
                biji: item.biji,
                berat: parseFloat(item.berat), // Berat manual dari input
                hargaPerGram: parseFloat(item.hargaPerGram), // Harga per gram dari input
                photo: item.photo,
              })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Nota berhasil disimpan!');
        // Reset form atau redirect
        window.location.reload();
      } else {
        const errorMessage = data.error || 'Gagal menyimpan nota';
        console.error('Error saving nota:', errorMessage);
        alert('Gagal menyimpan nota: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error saving nota:', error);
      alert('Terjadi kesalahan saat menyimpan nota: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const openCamera = (index) => {
    setCurrentItemIndex(index);
    setCameraOpen(true);
    
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }, 
      audio: false 
    })
      .then((videoStream) => {
        streamRef.current = videoStream;
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
        setCameraOpen(false);
      });
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && currentItemIndex !== null) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataURL = canvas.toDataURL('image/jpeg');
      
      const newItems = [...items];
      newItems[currentItemIndex].photo = dataURL;
      setItems(newItems);
      
      closeCamera();
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraOpen(false);
    setCurrentItemIndex(null);
  };

  const handleFileSelect = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItems = [...items];
        newItems[index].photo = event.target.result;
        setItems(newItems);
      };
      reader.readAsDataURL(file);
    }
  };

  const printNota = () => {
    window.print();
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };


  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />

      <div className="container mt-4 d-print-none no-print">
        <h1 className="mb-4">Buat Nota</h1>
        <div className="form-section">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Tanggal</label>
              <input 
                type="date" 
                className="form-control" 
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Nama / NIK Customer</label>
              <div className="position-relative">
                <input 
                  ref={customerInputRef}
                  type="text" 
                  className="form-control" 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  onFocus={() => customerSearch && customerResults.length > 0 && setShowCustomerDropdown(true)}
                  placeholder="Cari nama atau NIK..."
                />
                {showCustomerDropdown && customerResults.length > 0 && (
                  <div 
                    className="position-absolute w-100 bg-white border rounded shadow-lg"
                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {customerResults.map((customer) => (
                      <div
                        key={customer._id}
                        className="p-2 border-bottom cursor-pointer hover:bg-gray-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => selectCustomer(customer)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <strong>{customer.nama}</strong>
                        {customer.NIK && <span className="text-muted"> - {customer.NIK}</span>}
                        <br />
                        <small className="text-muted">{customer.alamat}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!customerId && nama && (
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={createNewCustomer}
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : '+ Buat Customer Baru'}
                </button>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">Nama</label>
              <input 
                type="text" 
                className="form-control" 
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                disabled={customerId !== null}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Alamat</label>
              <input 
                type="text" 
                className="form-control" 
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                disabled={customerId !== null}
              />
            </div>
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="row mb-3 item-row border-top pt-3">
              <div className="col-md-1">
                <label className="form-label">Biji</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="form-control" 
                  value={item.biji || 1}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    if (val === '') {
                      updateItem(index, 'biji', 1);
                    } else {
                      const numVal = parseInt(val);
                      if (numVal >= 1) {
                        updateItem(index, 'biji', numVal);
                      }
                    }
                  }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Nama Barang</label>
                <div className="position-relative">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={item.productSearch}
                    onChange={(e) => handleProductSearch(index, e.target.value)}
                    onFocus={() => {
                      if (item.productSearch && item.productResults.length > 0) {
                        const newItems = [...items];
                        newItems[index].showProductDropdown = true;
                        setItems(newItems);
                      }
                    }}
                    placeholder="Cari produk..."
                  />
                  {item.showProductDropdown && item.productResults.length > 0 && (
                    <div 
                      className="position-absolute w-100 bg-white border rounded shadow-lg"
                      style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {item.productResults.map((product) => (
                        <div
                          key={product._id}
                          className="p-2 border-bottom"
                          style={{ cursor: 'pointer' }}
                          onClick={() => selectProduct(product, index)}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <strong>{product.name}</strong>
                          <br />
                          <small className="text-muted">
                            Kadar: {product.kadarK || '-'} | Model: {product.code} | 
                            Berat Ref: {product.weight}g
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label">Kadar ±</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={item.kadar || ''}
                  readOnly
                  placeholder="Auto dari produk"
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Berat *</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    className="form-control" 
                    value={item.berat || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty, numbers, and single decimal point
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        updateItem(index, 'berat', val);
                      }
                    }}
                    placeholder="0.000"
                    required
                  />
                  <span className="input-group-text">gram</span>
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label">Harga/Gram *</label>
                <div className="input-group">
                  <span className="input-group-text">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    className="form-control" 
                    value={item.hargaPerGram || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, '');
                      updateItem(index, 'hargaPerGram', val);
                    }}
                    placeholder="Input manual"
                    required
                  />
                </div>
                {item.modelKode && goldPrices[item.modelKode] && (
                  <small className="text-muted">
                    Default: {formatRupiah(goldPrices[item.modelKode])}
                  </small>
                )}
              </div>
              <div className="col-md-2">
                <label className="form-label">Jumlah</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formatRupiah(item.jumlah)}
                  readOnly
                />
              </div>
              <div className="col-md-3 mt-2">
                <label className="form-label">Foto Barang</label>
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm"
                    onClick={() => openCamera(index)}
                  >
                    Ambil Foto
                  </button>
                  <input 
                    type="file" 
                    className="form-control form-control-sm" 
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e, index)}
                  />
                </div>
                {item.photo && (
                  <img 
                    src={item.photo} 
                    alt="Preview" 
                    className="mt-2" 
                    style={{ maxWidth: '100%', maxHeight: '100px', display: 'block' }}
                  />
                )}
              </div>
            </div>
          ))}
          
          <div className="d-flex gap-2 mb-3">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={addItemRow}
            >
              + Tambah Item
            </button>
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={saveNota}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : '💾 Simpan Nota'}
            </button>
            <button 
              type="button" 
              className="btn btn-info" 
              onClick={printNota}
            >
              🖨️ Cetak Nota
            </button>
          </div>
        </div>
      </div>

      <div className="print-area">
        <div className="nota-header">
          <div className="toko-title">
            <h1>TOKO PERHIASAN EMAS</h1>
            <h2>Sido Mulyo</h2>
            <div className="toko-address">
              Jl. Raya Gringgning No. 263 Kab. Kediri <br />
              ☎ (0354) 779303
            </div>
          </div>
          
          <div className="customer-info">
            <table>
              <tbody>
                <tr>
                  <td>Kediri tgl.</td>
                  <td>:</td>
                  <td>{formatDate(tanggal)}</td>
                </tr>
                <tr>
                  <td>Nama</td>
                  <td>:</td>
                  <td>{nama}</td>
                </tr>
                <tr>
                  <td>Alamat</td>
                  <td>:</td>
                  <td>{alamat}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="nota-title">
          Nota (Penerimaan barang harus diperiksa)
        </div>

        <table className="nota-table">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>Biji</th>
              <th style={{ width: '45%' }}>NAMA BARANG</th>
              <th style={{ width: '12%' }}>Kadar ±</th>
              <th style={{ width: '12%' }}>Berat</th>
              <th style={{ width: '12%' }}>Harga/Gram</th>
              <th style={{ width: '14%' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(item => item.productId).map((item, index) => {
              const beratNum = item.berat === '' ? 0 : parseFloat(item.berat) || 0;
              const beratFormatted = beratNum > 0 ? beratNum.toFixed(3) : '0.000';
              const maxNameLength = 50;
              
              let displayNamaBarang = item.namaBarang;
              let remainingText = '';
              
              if (item.namaBarang.length > maxNameLength) {
                displayNamaBarang = item.namaBarang.substring(0, maxNameLength);
                remainingText = item.namaBarang.substring(maxNameLength);
              }
              
              const fotoHTML = item.photo ? (
                <img 
                  src={item.photo} 
                  alt="Foto item" 
                  className="item-photo-in-table"
                />
              ) : '';
              
              return (
                <>
                  <tr key={index}>
                    <td style={{ textAlign: 'center' }}>{item.biji}</td>
                    <td style={{ textAlign: 'left', position: 'relative' }}>
                      {fotoHTML}
                      {displayNamaBarang}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.kadar || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{beratFormatted} gram</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(parseFloat(item.hargaPerGram) || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(item.jumlah || 0)}</td>
                  </tr>
                  {remainingText && (
                    <tr key={`${index}-cont`}>
                      <td></td>
                      <td style={{ textAlign: 'left' }}>{remainingText}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                </>
              );
            })}
            {Array.from({ length: Math.min(2, 7 - items.filter(i => i.productId).length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold', border: 'none' }}>
                Jumlah Rp.
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatRupiah(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="bottom-section">
          <div className="terbilang">
            Terbilang: {terbilang ? `${terbilang} rupiah` : ''}
          </div>
          <div className="hari-tutup">HARI JUM&apos;AT TUTUP</div>
        </div>

        <div className="decoration-line"></div>

        <div style={{ clear: 'both' }}></div>

        <div className="footer-note">
          <h4>PERHATIAN :</h4>
          <ol>
            <li>Kalau mengembalikan barang harus membawa NOTA ini, dan dibeli menurut harga pasaran umum.</li>
            <li>Istilah tukar adalah <u>jual beli</u>, bila kurang puas dengan yang anda beli, bisa ditukar dalam waktu 2 hari.</li>
            <li>Bila Nota dirubah dianggap tidak berlaku.</li>
          </ol>
          <div className="thanks">
            TERIMA KASIH ATAS KUNJUNGAN ANDA, SEMOGA PUAS<br />
            DAN TETAP MENJADI LANGGANAN DI TOKO KAMI.
          </div>
        </div>
      </div>

      {/* Camera Container */}
      <div className={`camera-container ${cameraOpen ? 'open' : ''}`}>
        <video 
          ref={videoRef} 
          className="camera-preview" 
          autoPlay
          playsInline
        ></video>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <div className="camera-buttons">
          <button 
            className="camera-btn take-photo-btn"
            onClick={takePhoto}
          >
            Ambil Foto
          </button>
          <button 
            className="camera-btn cancel-photo-btn"
            onClick={closeCamera}
          >
            Batal
          </button>
        </div>
      </div>
    </>
  );
}

export default function NotaPage() {
  return (
    <AdminProtect>
      <NotaContent />
    </AdminProtect>
  );
}
