/**
 * Frontend product total price handler
 *
 * @version 1.0.0
 * @package Single Product Total
 */

;(function($, window, document){
	class SPTotalPrice{
		constructor(){
            this.timer     = null; // debounce previous event timing.
            this.delay     = parseInt( sptotal_data.delay ) || 1000; // event delay.
            this.priceWrap = null; // current price wrap.
            this.items     = []; // qty - price relation array.

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
            const loader = $( document ).find( '.sptotal .sptotal-loading' );
            if( ! isActive ){
                loader.remove();
                return;
            }
            if( ! loader || 0 === loader.length ) {
                $( document ).find( '.sptotal' ).prepend( '<div class="sptotal-loading"></div>' );
            }
        }
        browseProductItems(){
            const qtyWraps = $( document ).find( '#content form.cart .quantity .qty, #main-content form.cart .quantity .qty, #main form.cart .quantity .qty, main form.cart .quantity .qty, #brx-content form.cart .quantity .qty' );

            this.items = []; // reset item states.

            if( 1 === qtyWraps.length ){
                this.updateProductTotal( qtyWraps, false );
            } else {
                // grouped product handler.
                qtyWraps.each( ( _, el ) => {
                    this.updateProductTotal( $( el ), true );
                });
            }

            this.updateTotalPriceHtml();
            this.appendToPrice();
            this.spinner( false );
        }
        updateProductTotal( el, isGrouped ){
            this.priceWrap = this.getPriceWrap( el, isGrouped );
            if( ! this.priceWrap || 0 === this.priceWrap.length ) {
                return;
            }

            const price = this.extractPriceFromHtml( this.priceWrap );
            const qty   = parseInt( el.val() );
            if( 0 === price || isNaN( qty ) || ! qty || 0 === qty ){
                return;
            }

            if( ! this.hasVariation() ){
                return;
            }

            this.items.push( {
                qty:   qty,
                price: price,
                rp:    this.extractRegularPrice( this.priceWrap ), // regular price.
            } );
        }
        getPriceWrap( el, isGrouped ){
            if( isGrouped ) {
                return el.closest('.woocommerce-grouped-product-list-item').find('.woocommerce-grouped-product-list-item__price');
            }

            // check for variation price.
            if( $( 'body' ).hasClass( 'product-type-variable' ) ){
                return $( document ).find( '.single_variation_wrap .woocommerce-variation-price' );
            }

            // check for block theme product price.
            let priceWrap = $( document ).find( '.wp-block-columns .wp-block-woocommerce-product-price' );

            // final price fallback.
            return ! priceWrap || 0 === priceWrap.length ? $( document ).find( 'p.price' ) : priceWrap;
        }
        extractPriceFromHtml( elm ){
            let priceHtml = elm.find( 'ins .woocommerce-Price-amount' );            
            priceHtml     = priceHtml && priceHtml.length > 0 ? priceHtml : elm.find( '.woocommerce-Price-amount' ).not( 'del .woocommerce-Price-amount' );
            priceHtml     = priceHtml && priceHtml.length > 0 ? priceHtml : elm.find( '.woocommerce-Price-amount' ).last(); // use last price wrapper.
            if( priceHtml.length > 1 ){
                priceHtml = priceHtml.last().is( ':hidden' ) ? priceHtml.first() : priceHtml.last();
            }

            return this.extractToNumber( priceHtml.last().text().trim() );
        }
        hasVariation(){
            const total = $( document.body ).find( 'table.variations select' );
            return 0 === total.length || total.filter( function(){
                return $( this ).find( 'option:selected' ).val().length > 0;
            } ).length === total.length;
        }
        extractRegularPrice( elm ){
            const prices = elm.find( '.woocommerce-Price-amount' );
            return this.extractToNumber( 1 === prices.length ? prices.text().trim() : prices.first().text().trim() );
        }
        extractToNumber( priceHtml ){
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
            const total = this.items && this.items.length > 0 ? Object.values( this.items ).reduce( ( sum, item ) => {
                return sum + item.qty * item.price;
            }, 0 ) : 0;

            $( '.sptotal-price bdi' ).contents().filter( function(){
                return this.nodeType === 3;
            } ).first().replaceWith( this.formatNumber( 'number' === typeof override ? override : total ) );
        }
        formatNumber( price ){
            return parseFloat( price ).toLocaleString( sptotal_data.locale, {
                minimumFractionDigits: sptotal_data.dp,
                maximumFractionDigits: sptotal_data.dp,
                useGrouping: true
            } ).replace( ',', '%1$s' ).replace( '.', sptotal_data.ds ).replace( '%1$s', sptotal_data.ts );
        }
        appendToPrice(){
            const format = sptotal_data.ext_type;
            if( 0 === format.length || 'none' === format ){
                return;
            }

            $( '.extra-content' ).remove();

            let total   = 0;
            let itemVal = this.items && this.items.length > 0 ? Object.values( this.items ).reduce( ( sum, item ) => {
                total += item.price * item.qty;
                return sum + ( 'qty' === format ? item.qty : ( item.rp - item.price ) * item.qty );
            }, 0 ) : 0;
            if( 0 === itemVal ){
                return;
            }

            itemVal      = 'percent' === format && itemVal > 0 ? Math.round( ( itemVal * 100 ) / total ).toFixed( 0 ) + '%' : itemVal;
            const target = 'fixed' === format ? sptotal_data.wc_price.replace( this.formatNumber( 99999.99 ), this.formatNumber( itemVal ) ) : itemVal;

            let value = 'after' === sptotal_data.ext_position ? `${target} ${sptotal_data.ext_label}` : `${sptotal_data.ext_label} ${target}`;
            $( '.sptotal-price' ).after( `<div class="extra-content total-${format}">${value}</div>` );
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

        // Discount Rules and Dynamic Pricing for WooCommerce - plugin support.
        wccsLivePriceHookHandler(){
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