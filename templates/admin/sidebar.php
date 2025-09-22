<?php
/**
 * Plugin sidebar template
 *
 * @package Single_Product_Total
 */

global $sptotal__;

?>
<div class="sptotal-sidebar">
	<div class="sidebar_top">
		<h1><?php echo esc_html__( 'Missing any features?', 'single-product-total' ); ?></h1>
		<div class="tagline_side">
			<?php echo esc_html__( 'We offer custom work. If you need any custom feature or fix any issues, send us an email.', 'single-product-total' ); ?>
		</div>
		<div>
			<a href="<?php echo esc_url( $sptotal__['plugin']['contact_us'] ); ?>"><?php echo esc_html__( 'Customize now! Starts $99 only.', 'single-product-total' ); ?></a>
		</div>
	</div>
	<div class="support">
		<h3><?php echo esc_html__( 'Having issues?', 'single-product-total' ); ?></h3>
		<p><?php echo esc_html__( 'If you are having any issues or any problem understanding any part of the plugin, please contact us.', 'single-product-total' ); ?></p>
		<p><a href="<?php echo esc_url( $sptotal__['plugin']['contact_us'] ); ?>"><?php echo esc_html__( 'Contact Us', 'single-product-total' ); ?></a></p>
	</div>
</div>
