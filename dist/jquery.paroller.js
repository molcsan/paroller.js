function init($) {
    let working = false;
    const scrollAction = function () {
        working = false;
    };

    const setDirection = {
        bgVertical: function (elem, bgOffset) {
            return elem.css({'background-position': 'center ' + -bgOffset + 'px'});
        },
        bgHorizontal: function (elem, bgOffset) {
            return elem.css({'background-position': -bgOffset + 'px' + ' center'});
        },
        vertical: function (elem, elemOffset, transition, oldTransform) {
            (oldTransform === 'none' ? oldTransform = '' : true);
            return elem.css({
                '-webkit-transform': 'translateY(' + elemOffset + 'px)' + oldTransform,
                '-moz-transform': 'translateY(' + elemOffset + 'px)' + oldTransform,
                'transform': 'translateY(' + elemOffset + 'px)' + oldTransform,
                'transition': transition,
                'will-change': 'transform'
            });
        },
        horizontal: function (elem, elemOffset, transition, oldTransform) {
            (oldTransform === 'none' ? oldTransform = '' : true);
            return elem.css({
                '-webkit-transform': 'translateX(' + elemOffset + 'px)' + oldTransform,
                '-moz-transform': 'translateX(' + elemOffset + 'px)' + oldTransform,
                'transform': 'translateX(' + elemOffset + 'px)' + oldTransform,
                'transition': transition,
                'will-change': 'transform'
            });
        }
    };

    const setMovement = {
        factor: function (elem, width, options) {
            const dataFactor = elem.data('paroller-factor');
            const factor = (dataFactor) ? dataFactor : options.factor;
            if (width < 576) {
                const dataFactorXs = elem.data('paroller-factor-xs');
                const factorXs = (dataFactorXs) ? dataFactorXs : options.factorXs;
                return (factorXs) ? factorXs : factor;
            } else if (width <= 768) {
                const dataFactorSm = elem.data('paroller-factor-sm');
                const factorSm = (dataFactorSm) ? dataFactorSm : options.factorSm;
                return (factorSm) ? factorSm : factor;
            } else if (width <= 1024) {
                const dataFactorMd = elem.data('paroller-factor-md');
                const factorMd = (dataFactorMd) ? dataFactorMd : options.factorMd;
                return (factorMd) ? factorMd : factor;
            } else if (width <= 1200) {
                const dataFactorLg = elem.data('paroller-factor-lg');
                const factorLg = (dataFactorLg) ? dataFactorLg : options.factorLg;
                return (factorLg) ? factorLg : factor;
            } else if (width <= 1920) {
                const dataFactorXl = elem.data('paroller-factor-xl');
                const factorXl = (dataFactorXl) ? dataFactorXl : options.factorXl;
                return (factorXl) ? factorXl : factor;
            } else {
                return factor;
            }
        },
        bgOffset: function (offset, factor) {
            return Math.round(offset * factor);
        },
        transform: function (offset, factor, windowHeight, height) {
            return Math.round((offset - (windowHeight / 2) + height) * factor);
        }
    };

    const clearPositions = {
        background: function (elem) {
            return elem.css({'background-position': 'unset'});
        },
        foreground: function (elem) {
            return elem.css({
                'transform': 'unset',
                'transition': 'unset'
            });
        }
    };

    $.fn.paroller = function (options) {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();

        // default options
        var options = $.extend({
            factor: 0, // - to +
            factorXs: 0, // - to +
            factorSm: 0, // - to +
            factorMd: 0, // - to +
            factorLg: 0, // - to +
            factorXl: 0, // - to +
            transition: 'translate 0.1s ease', // CSS transition
            type: 'background', // foreground
            direction: 'vertical' // horizontal
        }, options);

        return this.each(function () {
            const $this = $(this);
            let width = $(window).width();
            let offset = $this.offset().top;
            let height = $this.outerHeight();

            const dataType = $this.data('paroller-type');
            const dataDirection = $this.data('paroller-direction');
            const dataTransition = $this.data('paroller-transition');
            const oldTransform = $this.css('transform');

            const transition = (dataTransition) ? dataTransition : options.transition;
            const type = (dataType) ? dataType : options.type;
            const direction = (dataDirection) ? dataDirection : options.direction;
            let factor = 0;
            let bgOffset = setMovement.bgOffset(offset, factor);
            let transform = setMovement.transform(offset, factor, windowHeight, height);

            if (type === 'background') {
                if (direction === 'vertical') {
                    setDirection.bgVertical($this, bgOffset);
                }
                else if (direction === 'horizontal') {
                    setDirection.bgHorizontal($this, bgOffset);
                }
            }
            else if (type === 'foreground') {
                if (direction === 'vertical') {
                    setDirection.vertical($this, transform, transition, oldTransform);
                }
                else if (direction === 'horizontal') {
                    setDirection.horizontal($this, transform, transition, oldTransform);
                }
            }

            $(window).on('resize', function () {
                const scrolling = $(this).scrollTop();
                width = $(window).width();
                offset = $this.offset().top;
                height = $this.outerHeight();
                factor = setMovement.factor($this, width, options);
                bgOffset = Math.round(offset * factor);
                transform = Math.round((offset - (windowHeight / 2) + height) * factor);

                if (! working) {
                    window.requestAnimationFrame(scrollAction);
                    working = true;
                }

                if (type === 'background') {
                    clearPositions.background($this);
                    if (direction === 'vertical') {
                        setDirection.bgVertical($this, bgOffset);
                    }
                    else if (direction === 'horizontal') {
                        setDirection.bgHorizontal($this, bgOffset);
                    }
                }
                else if ((type === 'foreground') && (scrolling <= documentHeight)) {
                    clearPositions.foreground($this);
                    if (direction === 'vertical') {
                        setDirection.vertical($this, transform, transition);
                    }
                    else if (direction === 'horizontal') {
                        setDirection.horizontal($this, transform, transition);
                    }
                }
            });

            $(window).on('scroll', function () {
                const scrolling = $(this).scrollTop();
                const scrollTop = $(document).scrollTop();

                if (scrollTop === 0) {
                    factor = 0;
                } else {
                    factor = setMovement.factor($this, width, options);
                }

                bgOffset = Math.round((offset - scrolling) * factor);
                transform = Math.round(((offset - (windowHeight / 2) + height) - scrolling) * factor);

                if (! working) {
                    window.requestAnimationFrame(scrollAction);
                    working = true;
                }

                if (type === 'background') {
                    if (direction === 'vertical') {
                        setDirection.bgVertical($this, bgOffset);
                    }
                    else if (direction === 'horizontal') {
                        setDirection.bgHorizontal($this, bgOffset);
                    }
                }
                else if ((type === 'foreground') && (scrolling <= documentHeight)) {
                    if (direction === 'vertical') {
                        setDirection.vertical($this, transform, transition, oldTransform);
                    }
                    else if (direction === 'horizontal') {
                        setDirection.horizontal($this, transform, transition, oldTransform);
                    }
                }
            });
        });
    };
}

export default init;