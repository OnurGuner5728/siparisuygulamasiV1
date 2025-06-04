KAMPANYA YÖNETİMİ ÖZELLİKLERİ

Aşağıdaki kriterlere uygun şekilde çalışacak bir kampanya yönetim sistemi geliştir:

Kampanya Afişleri Görünümü

Hem “Yemek” hem “Market” hem de “Su” kategorileri için, ana sayfanın üst kısmında sırasıyla kampanya afişleri görüntülensin.

Kullanıcılar (restoran ya da market sahipleri), kendi panellerinden mevcut kampanyaları liste halinde görebilsinler ve istedikleri kampanyaya katılma talebi oluşturabilsinler.

Kampanya Oluşturma Yetkisi

Sadece sistem yöneticisi (ben) yeni kampanya ekleyebilsin.

Restoran ve market kullanıcıları, mevcut kampanyaları görüntüleyip katılım talebi gönderebilsin, fakat yeni kampanya oluşturma yetkileri olmasın.

Kampanya Detayları ve Özelleştirme

Kampanya oluştururken;

İstenilen afiş görselini yükleyebileyim.

Kampanyanın hangi kategoriye ait olduğunu seçebileyim: “Market”, “Yemek” veya “Su”.

Kampanya tipi olarak iki seçenek sunulsun:

Birim Tutar İndirimi: Örneğin “350 ₺ alışverişe 50 ₺ indirim” gibi sabit tutar bazlı kampanyalar.

Yüzde Tabanlı İndirim: Örneğin “Toplam tutarın %15’i kadar indirim” gibi oran bazlı kampanyalar.

Gelecekte farklı varyasyonlarda (örneğin “2 alana 1 bedava”, “belirli günlerde ekstra indirim” vb.) kampanya oluşturma imkânı eklenebilir.

Kategori ve Ürün Bazlı Kısıtlamalar

İsteğe bağlı olarak kampanyayı belirli kategori veya ürün gruplarına tanımlayabileyim.

Örnekler:

Sadece “Pizza” kategorisinde geçerli kampanya.

Market bölümünde “Bakliyat” ürünlerinde geçerli kampanya.

Bu kampanyaya dahil olan kategori veya ürünleri satan satıcılar, kampanyadan faydalanabilecek.

Birden Fazla Kampanyaya Katılım

Restoran veya market kullanıcılarının aynı anda birden fazla kampanyaya katılıp katılamayacağı sorunsalı:

Bu yetki tamamen yönetici (admin) onayına bağlı olacak.

Hangi kombinasyonların mümkün olduğunu, hangi kuralların geçerli olacağını (örneğin kampanyalar birbirini dışlıyor mu, üst üste uygulanabilir mi vb.) yönetici panelinden belirleyebileyim.

Bu esnekliğiuygulamaya entegre et. Mevcutta bir kampanya yönetimi var, onu geliştirebiliriz, geliştirirken başka bir dosyayı ya da kodu bozmamalıyız. Titiz davranıp kod tekrarına, var olan fonksiyonu tekrar yazmaya çalışmayalım. Supabase mcp ile "ozqsbbngkkssstmaktou" id'li proje üzerinde var olan tabloları inceleyerek ilerleyelim. Yaptıklarını ve yapacaklarını bu dosyaya özet şeklinde ekle.




banner'ın üstünde bulunan git ya da detaylar butonuna basınca campaign_applications sayfasında başvurusu kabul edilmiş mağazaların olduğu yeni bir sayfa gösterelim. bu sayfanın adı /kampanya/yemek - kampanya/market - kampanya/su şeklinde olsun. sadece kampanyaya katılan marketler listelensin


iptal edilen siparişten komisyon almak gibi bir saçmalık var şuan sistemde, tamamlanan siparişlerde komisyon hesaplanmalı. supabaes mcp ile gerekli kontrolleri sağla ve düzeltmeleri yap. başka bir yeri bozma.