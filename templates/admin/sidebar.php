<?php
/**
 * Plugin sidebar template
 *
 * @package Single_Product_Total
 */

global $sptotal__;

?>
<div class="sptotal-sidebar">
	<div class="site-intro">
		<h3><?php echo esc_html__( 'Contact', 'single-product-total' ); ?></h3>
		<div class="tagline_side">
			<?php echo esc_html__( 'If you are having any issues or any problem understanding any part of the plugin, please contact us.', 'single-product-total' ); ?>
		</div>
		<a href="<?php echo esc_url( $sptotal__['plugin']['contact_us'] ); ?>" target="_blank"><?php echo esc_html__( 'Contact Us', 'single-product-total' ); ?></a>
	</div>
	<div class="site-intro">
		<h3><?php echo esc_html__( 'Add new feature', 'single-product-total' ); ?></h3>
		<div class="tagline_side">
			<?php printf(
				esc_html__( 'Customize product total plugin. Add new custom feature.', 'single-product-total' )
			); ?>
		</div>
		<a href="https://webfixlab.com/wordpress-offer/" target="_blank"><?php echo esc_html__( 'Starting at $99', 'single-product-total' ); ?></a>
	</div>
</div>
