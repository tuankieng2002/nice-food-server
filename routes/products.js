const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const mongoose = require('mongoose');
//https://www.npmjs.com/package/multer
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        //cb(null, fileName + '-' + Date.now())
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

//http://localhost:3000/api/v1/products
router.get(`/`, async (req, res) => {
    //localhost://3000/api/v1/products?categories=21515155,26256262
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        return res.status(500).json({ success: false });
    }
    res.send(productList);
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ message: 'The product with the given ID was not found' });
    }
    res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    if (!mongoose.isValidObjectId(req.body.category)) {
        console.log("req.body not found");
        return res.status(400).send("Inavlid category id");
    };

    const category = await Category.findById(req.body.category);
    if (!category){
        console.log("category not found");
        return res.status(400).send('Invalid Category')

    }

    const file = req.file;
    if (!file) {
        console.log("file not found");
        return res.status(400).send('No image in the request')
    }

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,//"http://localhost:3000/public/upload/image-012345"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();

    if (!product)
        return res.status(500).send('The product cannot bt created!')


    res.send(product)
})

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.body.category)) {

        return res.status(400).send("Invalid category id");

    };

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }

    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).send('Invalid Category')
    }

    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )
    if (!product) {
        return res.status(500).send('The product cannot be updated!!');
    }
    res.send(product);
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'product not found!' });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
})

//lay tong so luong sp
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) {
        return res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount
    });
});

//nhung sp nổi bật
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const product = await Product.find({ isFeatured: true }).limit(+count);

    if (!product) {
        return res.status(500).json({ success: false });
    }
    res.send(product);
});

router.put('/galleryimages/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }
    const files = req.files
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((item) => {
            imagesPaths.push(`${basePath}${item.fileName}`);
        })
    }

    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    )
    if (!product) {
        return res.status(500).send('The product cannot be updated!!');
    }
    res.send(product);
})

module.exports = router;