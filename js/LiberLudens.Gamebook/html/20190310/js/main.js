$(document).ready(function () {
    //Burger menu to cross
    $('.navbar-toggle').on('click', function () {
        $(this).toggleClass('active');
    });

    //Collapse navbar on click
    $('.navbar-nav>li>a').on('click', function () {
        $('.navbar-collapse').collapse('hide');
        $('.navbar-toggle').toggleClass('active');
    });

    // Select all links with hashes
    $('a[href*="#"]')
        // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .click(function (event) {
        // On-page links
        if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
            location.hostname == this.hostname
        ) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - 100
                }, 1000);
            }
        }
    });

    //Scroll up
    $('.scroll-up, .navbar-brand').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });

    // Hide navbar on scroll down / Show on scroll up on mobile
    if ($(window).width() < 426) {
        var prevScrollpos = $(window).scrollTop();
        $(window).on('scroll', function () {
            var currentScrollPos = $(window).scrollTop();
            if (prevScrollpos > currentScrollPos) {
                $('.navbar').css('top', '0');
            } else {
                $('.navbar').css('top', '-100px');
            }
            prevScrollpos = currentScrollPos;
        });
    }
});