# Vendor Rebuild — vectorizer

## 当前版本
- `@neplex/vectorizer` 0.1.0 (npm, wasm32-wasi target)
- 已打 patch: `instantiateNapiModuleSync` → `instantiateNapiModule` + `asyncWorkPoolSize: 4 → 0`

## 重建命令
```bash
npm run build:vendor
```

## 产物
- `public/vendor/vectorizer/vectorizer.bundle.js` — 主 bundle（ESM, browser）
- `public/vendor/vectorizer/vectorizer.wasm32-wasi.wasm` — WASM 二进制（11MB）
- `public/vendor/vectorizer/worker.js` — emnapi worker 入口（备用，当前 pool=0 不触发）

## 为什么 pool=0
`asyncWorkPoolSize: 4` 在浏览器主线程 async 加载路径下触发 emnapi 内部 `AWMT` 时序 bug（`pthreads[tid]` 未注册时 `initWorkers` 读取 `undefined.whenLoaded`）。
单图转换本就是串行任务，pool=4 对「单用户转单图」场景并发收益≈0。
`singleThreadAsyncWork` 是 emnapi 官方支持的完整路径，语义不变。
