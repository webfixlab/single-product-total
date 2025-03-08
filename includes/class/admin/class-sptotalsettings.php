<?php
/**
 * Single product total admin loader class
 *
 * @package    WordPress
 * @subpackage Multiple Products to Cart for WooCommerce
 * @since      2.0
 */

if ( ! class_exists( 'SPTotalSettings' ) ) {
	/**
	 * Plugin loader main class
	 */
	class SPTotalSettings {



		/**
		 * Plugin init action hook - main entry of the plugin
		 */
		public function init() {
			add_action( 'admin_init', array( $this, 'save_settings' ) );
		}

		/**
		 * Save settings
		 *
		 * @return void
		 */
		public function save_settings() {
			global $sptotal__;

			if ( ! isset( $_POST['sptotal_save'] ) ) {
				return;
			}

			if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sptotal_save'] ) ), 'sptotal_save' ) ) {
				return;
			}

			foreach ( $sptotal__['fields'] as $meta_key => $data ) {
				if ( isset( $_POST[ $meta_key ] ) ) {
					update_option( $meta_key, sanitize_text_field( wp_unslash( $_POST[ $meta_key ] ) ) );
				} else {
					delete_option( $meta_key );
				}
			}

			$sptotal__['notice'][] = '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Settings saved.', 'single-product-total' ) . '</p></div>';
		}



		/**
		 * Render settings page template
		 *
		 * @return void
		 */
		public function settings_page() {
			?>
			<div class="sptotal-wrap">
				<?php $this->settings_header(); ?>
				<div class="sptotal-content-wrap">
					<div class="sptotal-main">
						<form action="" method="POST">
							<?php $this->settings_content(); ?>
						</form>
					</div>
					<div class="sptotal-side">
						<?php include SPTOTAL_PATH . 'templates/admin/sidebar.php'; ?>
					</div>
				</div>
			</div>
			<?php
		}

		/**
		 * Render settings page header
		 *
		 * @return void
		 */
		public function settings_header() {
			?>
			<div class="sptotal-heading">
				<h1 class=""><?php echo esc_html__( 'Single Product Total - Settings', 'single-product-total' ); ?></h1>
				<div class="heading-desc">
					<p>
						<a href="https://webfixlab.com/request-quote/"><?php echo esc_html__( 'SUPPORT', 'single-product-total' ); ?></a>
					</p>
				</div>
			</div>
			<div class="sptotal-notice">
				<?php $this->display_notice(); ?>
			</div>
			<?php
		}

		/**
		 * Render settings page content
		 *
		 * @return void
		 */
		public function settings_content() {
			?>
			<div class="row">
				<nav class="nav-tab-wrapper woo-nav-tab-wrapper">
					<a class="nav-tab nav-tab-active" data-target="general">
						<span class="dashicons dashicons-admin-settings"></span> <?php echo esc_html__( 'Settings', 'single-product-total' ); ?>
					</a>
				</nav>
			</div>
			<div class="sptotal-sections">
				<div class="section general">
					<table class="form-table">
						<tr>
							<th><?php echo esc_html__( 'Label', 'single-product-total' ); ?></th>
							<td>
								<label><?php $this->render_field( 'sptotal_total_text' ); ?></label>
							</td>
						</tr>
						<tr>
							<th><?php echo esc_html__( 'Price display', 'single-product-total' ); ?></th>
							<td class="forminp forminp-checkbox">
								<fieldset>
									<label>
										<?php $block = get_option( 'spline_if_inline' ); ?>
										<input type="checkbox" name="spline_if_inline" value="on" <?php echo 'on' === $block ? 'checked' : ''; ?>>
										<?php echo esc_html__( 'In separate lines', 'single-product-total' ); ?>
									</label>
								</fieldset>
							</td>
						</tr>
						<tr>
							<th><?php echo esc_html__( 'Position', 'single-product-total' ); ?></th>
							<td>
								<label><?php $this->render_field( 'sptotal_total_position' ); ?></label>
							</td>
						</tr>
						<tr>
							<th><?php echo esc_html__( 'Align items', 'single-product-total' ); ?></th>
							<td>
								<label><?php $this->render_field( 'sptotal_text_align' ); ?></label>
							</td>
						</tr>
						<tr>
							<th><?php echo esc_html__( 'Loader delay', 'single-product-total' ); ?></th>
							<td class="forminp forminp-text">
								<fieldset>
									<label>
										<?php $this->render_field( 'sptotal_delay' ); ?>
										<?php echo esc_html__( 'in milliseconds.', 'single-product-total' ); ?>
									</label>
									<p class="description"><?php echo esc_html__( 'For heavy sites set it higher. Example: 4500.', 'single-product-total' ); ?></p>
								</fieldset>
							</td>
						</tr>
						<tr>
							<th><?php echo esc_html__( 'Add to cart button', 'single-product-total' ); ?></th>
							<td class="forminp forminp-checkbox">
								<fieldset>
									<label>
										<?php $cart_btn = get_option( 'sptotal_cart_btn' ); ?>
										<input type="checkbox" name="sptotal_cart_btn" value="on" <?php echo 'on' === $cart_btn ? 'checked' : ''; ?>>
										<?php echo esc_html__( 'Show', 'single-product-total' ); ?>
									</label>
									<p class="description"><?php echo esc_html__( 'Works for fixed total positions only.', 'single-product-total' ); ?></p>
								</fieldset>
							</td>
						</tr>
						<tr>
							<th><?php echo esc_html__( 'Add to cart button label', 'single-product-total' ); ?></th>
							<td>
								<label><?php $this->render_field( 'sptotal_cart_btn_txt' ); ?></label>
							</td>
						</tr>
						<tr valign="top">
							<th scope="row" class="titledesc">
								<?php echo esc_html__( 'Label color', 'single-pruduct-total' ); ?>
							</th>
							<td class="forminp forminp-text">
								<?php $sptotal_label_color = get_option( 'sptotal_label_color' ) ?? ''; ?>
								<input name="sptotal_label_color" type="text" class="sptotal-colorpicker" value="<?php echo esc_attr( $sptotal_label_color ); ?>" data-default-color="">
							</td>
						</tr>
						<tr valign="top">
							<th scope="row" class="titledesc">
								<?php echo esc_html__( 'Price color', 'single-pruduct-total' ); ?>
							</th>
							<td class="forminp forminp-text">
								<?php $sptotal_price_color = get_option( 'sptotal_price_color' ) ?? ''; ?>
								<input name="sptotal_price_color" type="text" class="sptotal-colorpicker" value="<?php echo esc_attr( $sptotal_price_color ); ?>" data-default-color="">
							</td>
						</tr>
						<tr valign="top">
							<th scope="row" class="titledesc">
								<?php echo esc_html__( 'Background color', 'single-pruduct-total' ); ?>
							</th>
							<td class="forminp forminp-text">
								<?php $sptotal_background = get_option( 'sptotal_background' ) ?? ''; ?>
								<input name="sptotal_background" type="text" class="sptotal-colorpicker" value="<?php echo esc_attr( $sptotal_background ); ?>" data-default-color="">
							</td>
						</tr>
					</table>
				</div>
				<?php do_action( 'sptotal_extra_section' ); ?>
			</div>
			<div class="">
				<input type="hidden" value="<?php echo esc_attr( wp_create_nonce( 'sptotal_save' ) ); ?>" name="sptotal_save">
				<input type="submit" value="<?php echo esc_html__( 'Save changes', 'single-product-total' ); ?>" class="button-primary woocommerce-save-button sptotal-save">
			</div>
			<?php
		}



		/**
		 * Render field
		 *
		 * @param  string $name Field name.
		 * @return void
		 */
		public function render_field( $name ) {
			global $sptotal__;

			if ( ! isset( $sptotal__['fields'][ $name ] ) ) {
				return;
			}

			// get data.
			$data = $sptotal__['fields'][ $name ];

			if ( 'text' === $data['type'] ) {
				$value = get_option( $name );
				printf( '<input type="%s" name="%s" placeholder="%s" value="%s">', esc_attr( $data['type'] ), esc_attr( $name ), esc_html( $data['placeholder'] ), esc_html( $value ) );
			} elseif ( 'select' === $data['type'] ) {
				if ( ! isset( $data['options'] ) ) {
					return;
				}

				$html  = '';
				$value = get_option( $name );
				foreach ( $data['options'] as $v => $label ) {
					$selected = '';
					if ( $value === $v ) {
						$selected = ' selected';
					}

					$html .= sprintf( '<option value="%s"%s>%s</option>', esc_attr( $v ), $selected, esc_html( $label ) );
				}

				printf(
					'<select name="%s">%s</select>',
					esc_attr( $name ),
					wp_kses(
						$html,
						array(
							'option' => array(
								'value'    => array(),
								'selected' => array(),
							),
						)
					)
				);
			}
		}

		/**
		 * Display admin notices
		 *
		 * @return void
		 */
		public function display_notice() {
			global $sptotal__;

			$allowed_html = wp_kses_allowed_html( 'post' );

			if ( empty( $allowed_html ) ) {
				$allowed_html = array(
					'div'    => array(
						'id'    => array(),
						'class' => array(),
					),
					'h3'     => array( 'class' => array() ),
					'p'      => array( 'class' => array() ),
					'a'      => array(
						'href'  => array(),
						'class' => array(),
					),
					'strong' => array( 'class' => array() ),
					'button' => array(
						'type'  => array(),
						'class' => array(),
					),
					'span'   => array( 'class' => array() ),
				);
			}

			$allowed_html['style']  = array();
			$allowed_html['script'] = array();

			// display admin notices.
			if ( isset( $sptotal__['notice'] ) ) {
				foreach ( $sptotal__['notice'] as $notice ) {
					echo wp_kses( $notice, $allowed_html );
				}
			}
		}
	}
}

$settings_class = new SPTotalSettings();
$settings_class->init();
