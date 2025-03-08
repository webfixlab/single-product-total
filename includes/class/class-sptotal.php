<?php
/**
 * Single product total frontend class
 *
 * @package    WordPress
 * @subpackage Multiple Products to Cart for WooCommerce
 * @since      2.0
 */

if ( ! class_exists( 'SPTotal' ) ) {
	/**
	 * Plugin frotend class
	 */
	class SPTotal {



		/**
		 * Single product total settings data
		 *
		 * @var array.
		 */
		private $settings;



		/**
		 * Frontend total price constructor
		 */
		public function __construct() {
			$this->settings = array();
			$this->settings['styles'] = array();

			// get the position of the total price.
			$this->settings['position'] = get_option( 'sptotal_total_position' );
			if ( empty( $this->settings['position'] ) ) {
				$this->settings['position'] = 'before_cart_btn';
			}

			// total text.
			$this->settings['label'] = get_option( 'sptotal_total_text' );

			// if show total inline.
			$this->settings['if_inline'] = get_option( 'spline_if_inline' );

			// if show add to cart button.
			$this->settings['cart_btn']     = get_option( 'sptotal_cart_btn' );
			$this->settings['cart_btn_txt'] = get_option( 'sptotal_cart_btn_txt' );
			if ( ! isset( $this->settings['cart_btn_txt'] ) || empty( $this->settings['cart_btn_txt'] ) ) {
				$this->settings['cart_btn_txt'] = __( 'Add to cart', 'single-pruduct-total' );
			}
		}

		/**
		 * Init hook
		 */
		public function init() {
			if ( 'before_price' === $this->settings['position'] ) {
				add_action( 'woocommerce_single_product_summary', array( $this, 'display_total' ), 9 );
			} elseif ( 'after_price' === $this->settings['position'] ) {
				add_action( 'woocommerce_single_product_summary', array( $this, 'display_total' ), 11 );
			} elseif ( 'after_cart_btn' === $this->settings['position'] ) {
				add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'display_total' ) );
			} elseif ( 'before_cart_btn' === $this->settings['position'] ) {
				add_action( 'woocommerce_before_add_to_cart_button', array( $this, 'display_total' ) );
			} else {
				add_action( 'wp_footer', array( $this, 'display_total' ) );
			}
		}



		/**
		 * Display total price
		 */
		public function display_total() {
			global $post;
			global $product;
			if ( empty( $product ) || empty( $post ) || 'product' !== $post->post_type ) {
				return;
			}

			if ( 'object' !== $product ) {
				$product = wc_get_product( $post->ID );
			}

			// skip for external/affiliate products.
			if ( 'external' === $product->get_type() ) {
				return;
			}

			if ( ! is_singular( 'product' ) ) {
				return;
			}

			$c = $this->get_color();
			if ( false !== strpos( $this->settings['position'], 'fixed' ) ) {
				$this->settings['position'] .= ' fixed';
			}

			?>
			<div class="sptotal <?php echo esc_attr( $this->settings['position'] ); ?> <?php echo esc_attr( $c['class'] ); ?>" style="<?php echo isset( $c['background'] ) && ! empty( $c['background'] ) ? esc_html( $c['background'] ) : ''; ?>">
				<?php
					$this->total_label();
					$this->total_price();
					$this->total_cart_button();
				?>
			</div>
			<?php
		}

		public function total_label(){
			if( empty( $this->settings['label'] ) ){
				return;
			}

			?>
			<label style="<?php echo esc_html( $this->settings['styles']['label'] ); ?>"><?php echo esc_html( $this->settings['label'] ); ?></label>
			<?php
		}

		public function total_price(){
			global $product;

			?>
			<div class="sptotal-price" style="<?php echo esc_html( $this->settings['styles']['price'] ); ?>">
				<?php $this->display_price( $product->get_price() ); ?>
			</div>
			<?php
		}

		public function total_cart_button(){
			if ( false === strpos( $this->settings['position'], 'fixed' ) || 'on' !== $this->settings['cart_btn'] ) {
				return;
			}

			?>
			<div class="sptotal-cart-btn"><?php echo esc_html( $this->settings['cart_btn_txt'] ); ?></div>
			<?php
		}

		/**
		 * Return total price html
		 *
		 * @param string $price product price.
		 */
		public function display_price( $price ) {
			$price = number_format(
				$price,
				wc_get_price_decimals(),
				wc_get_price_decimal_separator(),
				wc_get_price_thousand_separator()
			);

			$pos = get_option( 'woocommerce_currency_pos' ) ?? 'left_space';
			$this->log('wc cur pos ' . $pos);

			?>
			<bdi>
				<?php if( 'left' === $pos || 'left_space' === $pos ) : ?>
					<span class="currency">
						<?php echo get_woocommerce_currency_symbol(); ?>
						<?php echo 'left_space' === $pos ? '&nbsp;' : ''; ?>
					</span>
				<?php endif; ?>
				<span class="total-price"><?php echo esc_attr( $price ); ?></span>
				<?php if( 'right' === $pos || 'right_space' === $pos ) : ?>
					<span class="currency">
						<?php echo 'left_space' === $pos ? '&nbsp;' : ''; ?>
						<?php echo get_woocommerce_currency_symbol(); ?>
					</span>
				<?php endif; ?>
			</bdi>
			<?php
		}
		public function display_currency( $pos ){
			// 
		}
		private function log( $data ) {
			if ( true === WP_DEBUG ) {
				if ( is_array( $data ) || is_object( $data ) ) {
					error_log( print_r( $data, true ) );
				} else {
					error_log( $data );
				}
			}
		}

		/**
		 * Get color settings
		 */
		public function get_color() {
			$w = '#ffffff'; // white color.

			$lc = get_option( 'sptotal_label_color' );
			$pc = get_option( 'sptotal_price_color' );
			$bg = get_option( 'sptotal_background' );
			$ta = get_option( 'sptotal_text_align' );

			if ( ( ! empty( $lc ) && $lc === $bg ) || ( empty( $bg ) && $lc === $w ) ) {
				$lc = '';
			}
			if ( ( ! empty( $pc ) && $pc === $bg ) || ( empty( $bg ) && $pc === $w ) ) {
				$pc = '';
			}

			$d = array(
				'label'      => ! empty( $lc ) ? 'color: ' . $lc . ';' : '',
				'price'      => ! empty( $pc ) ? 'color: ' . $pc . ';' : '',
				'background' => ! empty( $bg ) ? 'background: ' . $bg . ';' : '',
				'class'      => 'on' === $this->settings['if_inline'] ? 'sptotal-block' : '',
			);

			$d['class']      .= ! empty( $bg ) ? ' has-color' : '';
			$d['background'] .= ! empty( $ta ) ? 'text-align: ' . esc_attr( $ta ) . ';' : '';

			$this->settings['styles'] = $d;

			return $d;
		}
	}
}

$front_class = new SPTotal();
$front_class->init();
