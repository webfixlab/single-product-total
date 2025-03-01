/**
 * Single Product Total Admin JS
 *
 * @version 1.0.0
 * @package Single Product Total
 */

(function ($) {

	/**
	 * Using global variable
	 *
	 * @param sptotal_admin_data
	 */
	$( window ).on( // sticky header/menu.
		'scroll',
		function () {
			if ( $( window ).scrollTop() > 40 ) {
				$( '.sptotal-wrap' ).addClass( 'sptotal-sticky-top' );
			} else {
				if ( $( '.sptotal-wrap' ).hasClass( 'sptotal-sticky-top' ) ) {
					$( '.sptotal-wrap' ).removeClass( 'sptotal-sticky-top' );
				}
			}
		}
	);

	$( document ).ready(
		function () {
			$( '.sptotal-colorpicker' ).wpColorPicker();
		}
	);

})( jQuery );
