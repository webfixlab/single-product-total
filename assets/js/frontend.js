/**
 * Frontend product total price handler
 *
 * @version 1.0.0
 * @package Single Product Total
 */

;(function($, window, document){
	class SPTotalPrice{
		constructor(){
            this.timer = null; // debounce previous event timing.
            this.delay = parseInt( sptotal_data.settings.delay ) || 1000; // event delay.
            this.total = 0.0; // total price.
			$( document ).ready( () => this.initEvents() );
		}
        initEvents(){
            this.initEventsHandlers(); // event trigger handlers.
            this.initEventTriggers(); // mine for triggers.
            this.calculateTotal(); // initial calculation.
        }
        initEventsHandlers(){
            $( document ).on( 'click', '.sptotal-cart-btn', ( e ) => this.addToCartHandler() );
        }
        calculateTotal(){
            // reset on overlapping requests to run once.
            if( this.timer ){
                clearTimeout( this.timer );
            }
            this.spinner( true );
            this.timer = setTimeout( () => this.browseProductItems(), this.delay );
        }
        spinner( isActive ){
            const spinWrap   = $( document ).find( '.sptotal .sptotal-loading' );
            const totalPrice = $( document ).find( '.sptotal-price' );

            totalPrice.toggleClass( 'sptotal-disable', isActive );
            if( ! spinWrap || 0 === spinWrap.length ) {
                totalPrice.before( '<div class="sptotal-loading"></div>' );
            }
            if( ! isActive ){
                spinWrap.remove();
            }
        }
        browseProductItems(){
            const qtyWraps = $( document ).find( '#content form.cart .quantity .qty, #main-content form.cart .quantity .qty, #main form.cart .quantity .qty, main form.cart .quantity .qty, #brx-content form.cart .quantity .qty' );

            this.total = 0;
            if( 1 === qtyWraps.length ){
                this.updateProductTotal( qtyWraps, false );
            } else {
                // grouped product handler.
                qtyWraps.each( ( _, el ) => {
                    this.updateProductTotal( $( el ), true );
                });
            }

            this.updateTotalPriceHtml();
            this.spinner( false );
        }
        updateProductTotal( el, isGrouped ){
            const priceWrap = this.getPriceWrap( el, isGrouped );
            if( ! priceWrap || 0 === priceWrap.length ) {
                return;
            }

            const price = this.extractPriceFromHtml( priceWrap );
            if( 0 === price ){
                return;
            }

            const qty = parseInt( el.val() );
            if( isNaN( qty ) || ! qty || 0 === qty ){
                return;
            }
            this.total = isGrouped ? this.total + ( price * qty ) : price * qty;
        }
        getPriceWrap( el, isGrouped ){
            if( isGrouped ) {
                return el.closest('.woocommerce-grouped-product-list-item').find('.woocommerce-grouped-product-list-item__price');
            }

            // check for variation price.
            let priceWrap = $( document ).find( '.single_variation_wrap .woocommerce-variation-price' );

            // check for block theme product price.
            priceWrap = ! priceWrap || 0 === priceWrap.length ? $( document ).find( '.wp-block-columns .wp-block-woocommerce-product-price' ) : priceWrap;

            // final price fallback.
            return ! priceWrap || 0 === priceWrap.length ? $( document ).find( 'p.price' ) : priceWrap;
        }
        extractPriceFromHtml( priceWrap ){
            let priceHtml = priceWrap.find( 'ins .woocommerce-Price-amount' );
            
            // or check anything that's not regular price.
            priceHtml = priceHtml ? priceHtml : priceWrap.find( '.woocommerce-Price-amount' ).not( 'del .woocommerce-Price-amount' );

            priceHtml = priceHtml ? priceHtml : priceWrap.find( '.woocommerce-Price-amount' ).last(); // use last price wrapper.
            
            priceHtml = priceHtml.last().text().trim();
            if( ! priceHtml ){
                return 0;
            }
            
            const escapedTS = sptotal_data.ts.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ); // escaped thousand separator first for accuracy.
            let priceString = priceHtml.replace( new RegExp( escapedTS, 'g' ), '' ); // completely remove ts.
            priceString = priceString.replace( sptotal_data.ds, '.' ); // remove decimal separator.
            priceString = priceString.replace( /[^\d.]/g, '' ); // extract digits only.

            const price = parseFloat( priceString );
            return isNaN( price ) ? 0 : price;
        }
        updateTotalPriceHtml( override = '' ){
            const total = 'number' === typeof override ? override : this.total;
            this.total = total; // reset total value.
            const formattedPrice = parseFloat( total ).toFixed( sptotal_data.dp || 2 ).replace( '.', sptotal_data.ds );
            $( '.sptotal-price bdi' ).contents().filter( function(){
                return this.nodeType === 3;
            } ).first().replaceWith( formattedPrice );
        }
        addToCartHandler(){
            let cartBtn = $( document ).find( 'form.cart .single_add_to_cart_button' );
            cartBtn = cartBtn || cartBtn.length > 0 ? cartBtn : $( document ).find( '.single_add_to_cart_button')
            if( ! cartBtn || 0 === cartBtn.length ){
                return;
            }
            cartBtn.trigger( 'click' );
        }

        initEventTriggers(){
            this.defaultQtyChanged();
            this.defaultVariationChanged();
            this.variationSwatchesClicked();
            this.dynamicPricingYITH();
            this.customEventHooksHandler();
        }
        defaultQtyChanged(){
            $( document ).on(
                'change input',
                '#content form.cart .quantity .qty, #main-content form.cart .quantity .qty, #main form.cart .quantity .qty, main form.cart .quantity .qty, #brx-content form.cart .quantity .qty',
                () => this.calculateTotal()
            );
			$( document ).on( 'click', '.minus, .plus', () => this.calculateTotal() );
        }
        defaultVariationChanged(){
            $( document ).on( 'change', '.variations select', ( e ) => this.variationEventHandler( $( e.currentTarget ).find( 'option:selected' ).val() ) );

			$( document ).on( 'click', 'a.reset_variations', () => this.variationEventHandler( 0 ) );
        }
        variationEventHandler( value ){
            if( ! value || 0 === value.length || 0 === value ){
                this.updateTotalPriceHtml( 0 );
            }else{
                this.calculateTotal();
            }
        }
        variationSwatchesClicked(){
            let swatches = $( document ).find( '.wpcvs-term-label' ); // WPC variations swatches | WPClever.
            swatches = swatches && swatches.length > 0 ? swatches : $( document ).find( '.variable-item-contents' ); // Variation swatches | Emran Ahmed.
            swatches = swatches && swatches.length > 0 ? swatches : $( document ).find( '.rtwpvs-term-span' ); // Variation swatches | RadiusTheme.
            swatches = swatches && swatches.length > 0 ? swatches : $( document ).find( '.yith_wccl_value' ); // Variation swatches | Yith.

            // our own Simple Variation Swatches plugin handler.

            if( ! swatches || 0 === swatches.length ) {
                return;
            }

            swatches.each( ( _, el ) => {
                $( el ).on( 'click', () => this.calculateTotal() );
            });
        }
        dynamicPricingYITH(){
            const tableCols = $( document ).find( '.ywdpd-quantity-table td' );
            if( ! tableCols || 0 === tableCols.length ){
                return;
            }

            tableCols.each( ( _, el ) => {
                $( el ).on( 'click', () => this.calculateTotal() );
            });
        }
        customEventHooksHandler(){
            // 3rd party: Discount Rules and Dynamic Pricing for WooCommerce.
			$( document ).ajaxSuccess( ( event, xhr, settings ) => {
				if ( settings.data && settings.data.indexOf( 'action=wccs_live_price' ) !== -1 ) {
					setTimeout( () => this.wccsLivePriceHookHandler(), 10 );
				}
			});
        }
        wccsLivePriceHookHandler(){
            // 3rd party: Discount Rules and Dynamic Pricing for WooCommerce.
			const wccsWrap = $( document ).find( '.wccs-live-total-price.price' );
			if ( !wccsWrap || 0 === wccsWrap.length ) {
                return;
            }

            const price = this.extractPriceFromHtml( wccsWrap );
            if( 0 === price ){
                return;
            }

            this.updateTotalPriceHtml( price );
        }
	}
	new SPTotalPrice();
})(jQuery, window, document);