# 🚨 Rules of Hooks İhlali Çözümü

## **Problem:**
```
React has detected a change in the order of Hooks called by SessionManager. 
This will lead to bugs and errors if not fixed.

Previous render        Next render
1. useState           useState
2. useState           useState  
3. useRef             useRef
4. useEffect          useEffect
5. useContext         useEffect
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

## **Kök Neden:**
SessionManager'da **conditional hook usage**:
```javascript
// ❌ YANLIŞ - Hook'lar koşullu çağrılıyor
const sessionSync = isDevelopment && initialized.current ? 
  { broadcastLogout: () => {}, broadcastCacheInvalidation: () => {} } :
  useSessionSync(); // Bu conditional hook!

const pageVisibility = isDevelopment && initialized.current ?
  { needsRefresh: false, triggerRefresh: () => {} } :
  useEnhancedPageVisibility(); // Bu da conditional hook!
```

## **✅ Çözüm:**

### **1. Hook'ları Her Zaman Çağır**
```javascript
// ✅ DOĞRU - Hook'lar her zaman çağrılır
const sessionSync = useSessionSync();
const pageVisibility = useEnhancedPageVisibility();

// Conditional logic sonrasında
const { broadcastLogout, broadcastCacheInvalidation } = isDevelopment && initialized.current ? 
  { broadcastLogout: () => {}, broadcastCacheInvalidation: () => {} } :
  sessionSync;

const { needsRefresh, triggerRefresh } = isDevelopment && initialized.current ?
  { needsRefresh: false, triggerRefresh: () => {} } :
  pageVisibility;
```

### **2. useEnhancedPageVisibility Sadeleştirme**
```javascript
// Çifte useEffect'leri tek useEffect'e birleştirdik
// Callback dependency hell'ini önledik
// Minimal dependency array'ler kullandık
```

### **3. useSessionSync Sadeleştirme**
```javascript
// Gereksiz callback'leri birleştirdik  
// Dependency array'leri sadeleştirdik
// Timeout ile safe initialization
```

## **📊 Rules of Hooks:**

### **✅ Doğru Kullanım:**
1. **Her zaman aynı sırada çağır**
2. **Component'in en üst seviyesinde çağır**
3. **Conditional/loop içinde çağırma**
4. **Early return'dan önce çağır**

### **❌ Yasaklar:**
- `if (condition) useEffect(...)` ❌
- `for (let i = 0; i < n; i++) useState()` ❌
- `function nestedFunc() { useState() }` ❌

## **🧪 Test Sonuçları:**

### **Önceki (Hata):**
```
🔴 Hook order violation
🔴 Cannot read properties of undefined  
🔴 Uncaught Error in SessionManager
```

### **Sonraki (Çözüm):**
```
🟢 Hook order consistent
🟢 No runtime errors
🟢 Stable render cycle
```

## **💡 En İyi Pratikler:**

### **Conditional Logic İçin:**
```javascript
// Hook'u çağır
const result = useCustomHook();

// Sonrasında conditional kullan
const finalValue = condition ? defaultValue : result;
```

### **Early Returns İçin:**
```javascript
function MyComponent() {
  // Tüm hook'ları çağır
  const state = useState();
  const effect = useEffect();
  
  // Sonrasında early return
  if (condition) return null;
  
  return <div>...</div>;
}
```

---

**✅ Rules of Hooks ihlali çözüldü! Artık hook order stable.** 