<?php
/**
 * Plugin Name:          Single Product Total for WooCommerce
 * Plugin URI:           https://wordpress.org/plugins/single-product-total/
 * Description:          Quickest way to show total price of a single product
 * Author:               WebFix Lab
 * Author URI:           https://webfixlab.com/
 * Version:              2.3.1
 * Requires at least:    4.9
 * Tested up to:         6.7.2
 * Requires PHP:         7.0
 * Tags:                 woocommerce product total,single product total,product total
 * WC requires at least: 3.6
 * WC tested up to:      9.7.0
 * License:              GPL2
 * License URI:          https://www.gnu.org/licenses/gpl-2.0.html
 * Requires Plugins:     woocommerce
 * Text Domain:          single-product-total
 *
 * @package              Single product total
 */

defined( 'ABSPATH' ) || exit;

// plugin path.
define( 'SPTOTAL', __FILE__ );
define( 'SPTOTAL_VER', '2.3.1' );
define( 'SPTOTAL_PATH', plugin_dir_path( SPTOTAL ) );

require SPTOTAL_PATH . 'includes/class/admin/class-sptotalloader.php';
