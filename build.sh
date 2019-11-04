# cleanup
rm -rf build

# create directories
mkdir -p build/scripts
mkdir -p build/node_modules

# copy used node modules
cp -r ./node_modules/react       ./build/node_modules/react
cp -r ./node_modules/react-dom   ./build/node_modules/react-dom

# copy files that are not built
cp ./src/*.js        ./build
cp ./src/index.html  ./build/index.html

# build
npm run build
