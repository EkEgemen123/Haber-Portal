const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Data directory setup
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');

// Initialize data files if they don't exist
function initializeDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(NEWS_FILE)) {
    const mockNews = [
      {
        id: 1,
        title: 'Türkiye\'de Yapay Zeka Konferansı Başladı',
        description: 'İstanbul\'da düzenlenen 2026 Yapay Zeka Konferansı bugün kapılarını açtı. Konferansta dünyanın en ünlü yapay zeka uzmanları bir araya gelecek.',
        content: 'Konferans 3 gün boyunca devam edecek ve yapay zekanın geleceği hakkında kapsamlı tartışmalar yapılacak.',
        author: 'Haber Ajansı',
        source: 'YZ Haberleri',
        image: 'https://images.unsplash.com/photo-1677442d019cecf8d6cb94c5c69b6915?w=500&h=300&fit=crop',
        category: 'Teknoloji',
        published_at: new Date().toISOString(),
        liked_by: [],
        shared_by: [],
        comments: []
      },
      {
        id: 2,
        title: 'Enerji Sektöründe Yeni Yatırımlar',
        description: 'Yenilenebilir enerji kaynakları için rekor yatırımlar yapılıyor. Bu yıl güneş enerjisinde 40% artış bekleniliyor.',
        content: 'Türkiye yenilenebilir enerjide önemli adımlar atıyor. Rüzgar ve güneş enerjisi projeleri hız kazanmış durumda.',
        author: 'Ekonomi Servisi',
        source: 'Enerji Bakanması',
        image: 'https://images.unsplash.com/photo-1509391366360-2e938eda7e82?w=500&h=300&fit=crop',
        category: 'Ekonomi',
        published_at: new Date(Date.now() - 86400000).toISOString(),
        liked_by: [],
        shared_by: [],
        comments: []
      },
      {
        id: 3,
        title: 'Spor Alanında Yeni Rekortmen',
        description: 'Genç atlet Ahmet Öz, 100 metre koşuda yeni Türkiye rekoru kırdı. Zamanı 9.87 saniye olarak kaydedildi.',
        content: 'Gençlik ve Spor Bakanlığı bu başarıyı tebrik etti. Atlet Olimpiyat hazırlıklarına devam edecek.',
        author: 'Spor Editörü',
        source: 'Spor Haberleri',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
        category: 'Spor',
        published_at: new Date(Date.now() - 172800000).toISOString(),
        liked_by: [],
        shared_by: [],
        comments: []
      },
      {
        id: 4,
        title: 'Sağlık Alanında Önemli Gelişme',
        description: 'Türk yapay zeka şirketi, kanser teşhisi için yeni bir yazılım geliştirdi. Yazılım %99 doğruluk oranına sahip.',
        content: 'Yazılım, hastanelerde pilot uygulamaya başlanacak. Sağlık Bakanı bu gelişmeyi överek tebrik etti.',
        author: 'Sağlık Muhabiri',
        source: 'Tıp Haberleri',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop',
        category: 'Sağlık',
        published_at: new Date(Date.now() - 259200000).toISOString(),
        liked_by: [],
        shared_by: [],
        comments: []
      },
      {
        id: 5,
        title: 'İstanbul\'da Yeni Metro Hattı Açıldı',
        description: 'Şehrin en uzun metro hattı bugün resmi olarak hizmet vermeye başladı. Hat 45 km uzunluğunda ve 25 istasyona sahip.',
        content: 'Başkan açılış töreninde hatta binerek test yolculuğu yaptı. Hattın kenti deştiği bölgeler arasında ulaşımı 30% hızlandıracağı tahmin ediliyor.',
        author: 'Şehircilik Muhabiri',
        source: 'Ulaştırma Haberleri',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop',
        category: 'İnsan',
        published_at: new Date(Date.now() - 345600000).toISOString(),
        liked_by: [],
        shared_by: [],
        comments: []
      }
    ];
    fs.writeFileSync(NEWS_FILE, JSON.stringify(mockNews, null, 2));
  }
}

// Helper functions to read/write JSON files
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readNews() {
  try {
    const data = fs.readFileSync(NEWS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeNews(news) {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
}

// ============ API ENDPOINTS ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// AUTHENTICATION ENDPOINTS

// Register
app.post('/api/kayit', async (req, res) => {
  try {
    const { ad_soyad, email, sifre, profil_foto } = req.body;

    if (!ad_soyad || !email || !sifre) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

    const users = readUsers();
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'Email zaten kayıtlı' });
    }

    const sifreHash = await bcrypt.hash(sifre, 10);
    const newUser = {
      id: Date.now().toString(),
      ad_soyad,
      email,
      sifre: sifreHash,
      profil_foto: profil_foto || 'https://via.placeholder.com/150',
      olusturulma_tarihi: new Date().toISOString(),
      takip_ettikleri: [],
      takipcinleri: []
    };

    users.push(newUser);
    writeUsers(users);

    const token = generateToken(newUser.id);
    res.json({
      message: 'Kayıt başarılı',
      user: {
        id: newUser.id,
        ad_soyad: newUser.ad_soyad,
        email: newUser.email,
        profil_foto: newUser.profil_foto
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/giris', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(sifre, user.sifre))) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const token = generateToken(user.id);
    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        ad_soyad: user.ad_soyad,
        email: user.email,
        profil_foto: user.profil_foto
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile
app.get('/api/profil', verifyToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      id: user.id,
      ad_soyad: user.ad_soyad,
      email: user.email,
      profil_foto: user.profil_foto,
      takip_ettikleri: user.takip_ettikleri || [],
      takipcinleri: user.takipcinleri || []
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NEWS ENDPOINTS

// Get all news
app.get('/api/haberler', (req, res) => {
  try {
    const news = readNews();
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get news by category
app.get('/api/haberler/kategori/:kategori', (req, res) => {
  try {
    const { kategori } = req.params;
    const news = readNews();
    const filtered = news.filter(
      h => h.category.toLowerCase() === kategori.toLowerCase()
    );
    res.json(filtered);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single news
app.get('/api/haberler/:id', (req, res) => {
  try {
    const { id } = req.params;
    const news = readNews();
    const article = news.find(h => h.id == id);

    if (!article) {
      return res.status(404).json({ error: 'Haber bulunamadı' });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create news (admin only - simplified for demo)
app.post('/api/haberler', verifyToken, (req, res) => {
  try {
    const { title, description, content, author, source, image, category } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

    const news = readNews();
    const newArticle = {
      id: Math.max(...news.map(n => n.id || 0)) + 1,
      title,
      description,
      content,
      author: author || 'Bilinmiyor',
      source: source || 'Haber Sitesi',
      image: image || 'https://via.placeholder.com/300x200',
      category: category || 'Genel',
      published_at: new Date().toISOString(),
      liked_by: [],
      shared_by: [],
      comments: []
    };

    news.push(newArticle);
    writeNews(news);

    res.status(201).json({
      message: 'Haber oluşturuldu',
      news: newArticle
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LIKE/INTERACTION ENDPOINTS

// Like a news article
app.post('/api/haberler/:id/begen', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const news = readNews();
    const article = news.find(h => h.id == id);

    if (!article) {
      return res.status(404).json({ error: 'Haber bulunamadı' });
    }

    if (!article.liked_by) article.liked_by = [];

    if (article.liked_by.includes(req.userId)) {
      article.liked_by = article.liked_by.filter(uid => uid !== req.userId);
    } else {
      article.liked_by.push(req.userId);
    }

    writeNews(news);
    res.json({ message: 'Beğeni güncellendi', likes: article.liked_by.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Share a news article
app.post('/api/haberler/:id/paylas', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const news = readNews();
    const article = news.find(h => h.id == id);

    if (!article) {
      return res.status(404).json({ error: 'Haber bulunamadı' });
    }

    if (!article.shared_by) article.shared_by = [];

    if (!article.shared_by.includes(req.userId)) {
      article.shared_by.push(req.userId);
    }

    writeNews(news);
    res.json({ message: 'Haber paylaşıldı', shares: article.shared_by.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add comment to news
app.post('/api/haberler/:id/yorum', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Yorum metni gerekli' });
    }

    const news = readNews();
    const article = news.find(h => h.id == id);

    if (!article) {
      return res.status(404).json({ error: 'Haber bulunamadı' });
    }

    const users = readUsers();
    const user = users.find(u => u.id === req.userId);

    if (!article.comments) article.comments = [];

    const newComment = {
      id: Date.now().toString(),
      userId: req.userId,
      userName: user?.ad_soyad || 'Anonim',
      text,
      created_at: new Date().toISOString()
    };

    article.comments.push(newComment);
    writeNews(news);

    res.status(201).json({
      message: 'Yorum eklendi',
      comment: newComment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get comments for news
app.get('/api/haberler/:id/yorumlar', (req, res) => {
  try {
    const { id } = req.params;
    const news = readNews();
    const article = news.find(h => h.id == id);

    if (!article) {
      return res.status(404).json({ error: 'Haber bulunamadı' });
    }

    res.json(article.comments || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// FOLLOW ENDPOINTS

// Follow/unfollow user
app.post('/api/kullanicilar/:userId/takip', verifyToken, (req, res) => {
  try {
    if (req.userId === req.params.userId) {
      return res.status(400).json({ error: 'Kendinizi takip edemezsiniz' });
    }

    const users = readUsers();
    const currentUser = users.find(u => u.id === req.userId);
    const targetUser = users.find(u => u.id === req.params.userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (!currentUser.takip_ettikleri) currentUser.takip_ettikleri = [];
    if (!targetUser.takipcinleri) targetUser.takipcinleri = [];

    if (currentUser.takip_ettikleri.includes(req.params.userId)) {
      currentUser.takip_ettikleri = currentUser.takip_ettikleri.filter(
        id => id !== req.params.userId
      );
      targetUser.takipcinleri = targetUser.takipcinleri.filter(
        id => id !== req.userId
      );
    } else {
      currentUser.takip_ettikleri.push(req.params.userId);
      targetUser.takipcinleri.push(req.userId);
    }

    writeUsers(users);
    res.json({ message: 'Takip durumu güncellendi' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/kullanicilar/:userId', (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      id: user.id,
      ad_soyad: user.ad_soyad,
      profil_foto: user.profil_foto,
      takipcinleri: user.takipcinleri || [],
      takip_ettikleri: user.takip_ettikleri || []
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Initialize data files on startup
initializeDataFiles();

// Start server
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

module.exports = app;
