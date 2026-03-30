/**
 * Single Product Total Admin JS
 *
 * @version 1.0.0
 * @package Single Product Total
 */

(function ($) {
	$( window ).on( // sticky header/menu.
		'scroll',
		() => $( '.sptotal-wrap' ).toggleClass( 'sptotal-sticky-top', $( window ).scrollTop() > 40 )
	);
	$( document ).ready(
        () => $( '.sptotal-colorpicker' ).wpColorPicker()
    );
})( jQuery );
