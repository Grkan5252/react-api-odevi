import React, { useEffect, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [translatedProducts, setTranslatedProducts] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError("Veriler alınamadı");
      }
    };

    fetchProducts();
  }, []);

  // 2. TL kuru çek
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        setExchangeRate(data.rates.TRY); // TRY kuru
      } catch (err) {
        setError("Döviz kuru alınamadı");
      }
    };

    fetchExchangeRate();
  }, []);

  // 3. Çeviri işlemi (title + category)
  useEffect(() => {
    const translateText = async (text) => {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|tr`;
      const res = await fetch(url);
      const data = await res.json();
      return data.responseData.translatedText;
    };

    const translateProducts = async () => {
      const translated = await Promise.all(
        products.map(async (product) => {
          const translatedTitle = await translateText(product.title);
          const translatedCategory = await translateText(product.category);
          return {
            ...product,
            translatedTitle,
            translatedCategory,
          };
        })
      );
      setTranslatedProducts(translated);
      setLoading(false);
    };

    if (products.length > 0 && exchangeRate) {
      translateProducts();
    }
  }, [products, exchangeRate]);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Türkçeye Çevrilmiş Ürünler</h1>
      <ul>
        {translatedProducts.map((product) => (
          <li key={product.id} style={{ marginBottom: "30px" }}>
            <strong>{product.translatedTitle}</strong><br />
            Kategori: {product.translatedCategory}<br />
            Fiyat: {product.price} USD → {(product.price * exchangeRate).toFixed(2)} TL<br />
            <img src={product.image} alt={product.title} width="100" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
