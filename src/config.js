import path from 'path';
import * as url from 'url';

const config = {
    PORT: 8080,
    SERVER: 'atlas_16',
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)), 
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    MONGODB_URI: "mongodb+srv://roxanatperrotta:fOSUduUrKwVoG6yq@cluster0.bdtnqky.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
}

export default config;