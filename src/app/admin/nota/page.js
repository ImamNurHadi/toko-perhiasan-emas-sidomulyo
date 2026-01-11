'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import AdminProtect from '../../../../components/AdminProtect';
import './nota.css';

function NotaContent() {
  const [tanggal, setTanggal] = useState('');
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [items, setItems] = useState([
    { biji: 1, namaBarang: '', kadar: '', berat: '', model: '', jumlah: 0, photo: null }
  ]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [terbilang, setTerbilang] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

  // Set default date
  useEffect(() => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    setTanggal(dateString);
  }, []);

  // Update total and terbilang when items change
  useEffect(() => {
    let total = 0;
    items.forEach(item => {
      const berat = parseFloat(item.berat.replace(',', '.')) || 0;
      const modelValue = parseFloat(item.model) || 0;
      total += berat * modelValue;
    });
    setTotalAmount(total);
    setTerbilang(angkaTerbilang(Math.round(total)));
  }, [items]);

  const addItemRow = () => {
    setItems([...items, { 
      biji: items.length + 1, 
      namaBarang: '', 
      kadar: '', 
      berat: '', 
      model: '', 
      jumlah: 0,
      photo: null
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate jumlah if berat or model changes
    if (field === 'berat' || field === 'model') {
      const berat = parseFloat(newItems[index].berat.replace(',', '.')) || 0;
      const modelValue = parseFloat(newItems[index].model) || 0;
      newItems[index].jumlah = berat * modelValue;
    }
    
    setItems(newItems);
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

  const modelOptions = [
    { value: '', label: 'Pilih Model' },
    { value: '720000', label: 'XX (Rp. 720.000)' },
    { value: '680000', label: 'X (Rp. 680.000)' },
    { value: '645000', label: '+6 (Rp. 645.000)' }
  ];

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />

      <div className="container mt-4 d-print-none no-print">
        <h1 className="mb-4">Preview Nota</h1>
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
              <label className="form-label">Nama</label>
              <input 
                type="text" 
                className="form-control" 
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Alamat</label>
              <input 
                type="text" 
                className="form-control" 
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
              />
            </div>
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="row mb-3 item-row">
              <div className="col-md-1">
                <label className="form-label">Biji</label>
                <input 
                  type="number" 
                  min="1" 
                  className="form-control" 
                  value={item.biji}
                  onChange={(e) => updateItem(index, 'biji', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Nama Barang</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={item.namaBarang}
                  onChange={(e) => updateItem(index, 'namaBarang', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Kadar ±</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={item.kadar}
                  onChange={(e) => updateItem(index, 'kadar', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Berat</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={item.berat}
                    onChange={(e) => updateItem(index, 'berat', e.target.value)}
                    inputMode="decimal"
                  />
                  <span className="input-group-text">gram</span>
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label">Model</label>
                <select 
                  className="form-select" 
                  value={item.model}
                  onChange={(e) => updateItem(index, 'model', e.target.value)}
                >
                  {modelOptions.map((opt, optIndex) => (
                    <option key={optIndex} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                    className="btn btn-danger"
                    onClick={() => openCamera(index)}
                  >
                    Ambil Foto
                  </button>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*" 
                    capture="camera" 
                    style={{ display: 'none' }}
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
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={addItemRow}
          >
            Tambah Item
          </button>
          <button 
            type="button" 
            className="btn btn-success ms-2" 
            onClick={printNota}
          >
            Cetak Nota
          </button>
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
              <th style={{ width: '42%' }}>NAMA BARANG</th>
              <th style={{ width: '12%' }}>Kadar ±</th>
              <th style={{ width: '12%' }}>Berat</th>
              <th style={{ width: '12%' }}>Model</th>
              <th style={{ width: '14%' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              if (!item.namaBarang && !item.kadar && !item.berat && !item.model) {
                return null;
              }
              
              const berat = parseFloat(item.berat.replace(',', '.')) || 0;
              const beratFormatted = berat.toFixed(3);
              const modelText = modelOptions.find(opt => opt.value === item.model)?.label.split(' ')[0] || '';
              const jumlah = item.jumlah;
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
                    <td style={{ textAlign: 'center' }}>{item.kadar}</td>
                    <td style={{ textAlign: 'center' }}>{beratFormatted} gram</td>
                    <td style={{ textAlign: 'center' }}>{modelText}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(jumlah)}</td>
                  </tr>
                  {remainingText && (
                    <tr key={`${index}-cont`}>
                      <td></td>
                      <td style={{ textAlign: 'left' }}>{remainingText}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                </>
              );
            })}
            {Array.from({ length: Math.min(2, 7 - items.filter(i => i.namaBarang || i.kadar || i.berat || i.model).length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
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
              <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', border: 'none' }}>
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
