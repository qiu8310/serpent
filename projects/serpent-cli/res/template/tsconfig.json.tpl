{
  "extends": "./node_modules/@serpent/dev-kits/tsconfig.json",
  "include": ["src"],
  "compilerOptions": {
    "noEmitOnError": false,
    "lib": [
      "es2015.promise", "es2015.core", "es2015.collection", "es2016.array.include"
    ],
    "rootDir": "src",
    "outDir": "dist"
  }
}
