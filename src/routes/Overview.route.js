const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth')
const auth_validate = require('../controllers/Validate.controller');
const auth = auth_validate.validate;
// Require the controllers WHICH WE DID NOT CREATE YET!!
const Overview_controller = require('../controllers/Overview.controller');
const { validate } = require('../validator');
// a simple test url to check that all of our files are communicating correctly.

//Total Customer
router.get('/customers', auth, Overview_controller.Overview_customers);

//Total Orders
router.get('/orders', auth, Overview_controller.Overview_orders);

//Total revenue
router.get('/revenue', auth, Overview_controller.Overview_revenue);

//Customer monthly graph
router.get('/customer-graph', auth, Overview_controller.Overview_customer_graph);

//Order monthly graph
router.get('/order-graph', auth, Overview_controller.Overview_order_graph);


//Revenue monthly graph
router.get('/revenue-graph', auth, Overview_controller.Overview_revenue_graph);

//Product price graph
router.get('/price-graph/:id', auth, Overview_controller.Overview_price_graph);

//Revenue monthly graph
router.get('/stock-graph', auth, Overview_controller.Overview_stock_graph);
// router.get('/stock-pro-graph', auth, Overview_controller.Overview_stockproduct_graph);

//List of low stock product
router.get('/low-stocks', auth, Overview_controller.Overview_low_stocks);

//List of out of stock product
router.get('/out-of-stocks', auth, Overview_controller.Overview_out_of_stocks);

//List new order
router.get('/new-orders', auth, Overview_controller.Overview_new_orders);

//STATISTIC
router.get('/highest-rated-product', auth, Overview_controller.Overview_highest_rated_product);

router.get('/recently-sold', auth, Overview_controller.Overview_recently_sold);



router.get('/update', auth, Overview_controller.update);
router.get('/list', auth, Overview_controller.list);




module.exports = router;