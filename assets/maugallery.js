(function($) {
  $.fn.mauGallery = function(options) {
    var settings = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      var $gallery = $(this);
      
      // Création du conteneur de lignes si nécessaire
      $.fn.mauGallery.methods.createRowWrapper($gallery);
      
      // Création de la lightbox si l'option est activée
      if (settings.lightBox) {
        $.fn.mauGallery.methods.createLightBox($gallery, settings.lightboxId, settings.navigation);
      }
      
      // Configuration des écouteurs d'événements
      $.fn.mauGallery.listeners(settings);

      // Traitement de chaque élément de la galerie
      var $items = $gallery.children(".gallery-item");
      $items.each(function() {
        var $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, settings.columns);
        
        var theTag = $item.data("gallery-tag");
        if (settings.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
          tagsCollection.push(theTag);
        }
      });

      // Affichage des tags si l'option est activée
      if (settings.showTags) {
        $.fn.mauGallery.methods.showItemTags($gallery, settings.tagsPosition, tagsCollection);
      }

      // Affichage de la galerie
      $gallery.fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // Configuration des écouteurs d'événements pour les interactions
  $.fn.mauGallery.listeners = function(settings) {
    $(document).on("click", ".gallery-item", function() {
      if (settings.lightBox && $(this).is("img")) {
        $.fn.mauGallery.methods.openLightBox($(this), settings.lightboxId);
      }
    });

    // Début de la correction des filtres
    $(document).on("click", ".nav-link", function() {
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
      $.fn.mauGallery.methods.filterByTag.call(this);
    });
    // Fin de la correction des filtres

    // Début de la correction de la navigation dans la modale
    $(document).on("click", ".mg-prev", () => 
      $.fn.mauGallery.methods.prevImage(settings.lightboxId)
    );
    
    $(document).on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(settings.lightboxId)
    );
    // Fin de la correction de la navigation dans la modale
  };

  $.fn.mauGallery.methods = {
    createRowWrapper($element) {
      if (!$element.children().first().hasClass("row")) {
        $element.append('<div class="gallery-items-row row"></div>');
      }
    },
    
    wrapItemInColumn($element, columns) {
      var columnClasses = '';
      if (typeof columns === 'number') {
        columnClasses = `col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === 'object') {
        $.each(columns, function(size, count) {
          columnClasses += ` col-${size}-${Math.ceil(12 / count)}`;
        });
      } else {
        console.error(`Columns should be a number or object. ${typeof columns} is not supported.`);
      }
      $element.wrap(`<div class='item-column mb-4 ${columnClasses}'></div>`);
    },
    
    moveItemInRowWrapper($element) {
      $element.appendTo(".gallery-items-row");
    },
    
    responsiveImageItem($element) {
      if ($element.is("img")) {
        $element.addClass("img-fluid");
      }
    },
    
    openLightBox($element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", $element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    
    // Début de la correction de la navigation dans la lightbox
    prevImage(lightboxId) {
      let activeImageSrc = $(`#${lightboxId} .lightboxImage`).attr("src");
      let imagesCollection = this.getImagesCollection();
      let activeIndex = imagesCollection.indexOf(activeImageSrc);
      let prevIndex = (activeIndex === 0) ? imagesCollection.length - 1 : activeIndex - 1;
      $(`#${lightboxId} .lightboxImage`).attr("src", imagesCollection[prevIndex]);
    },

    nextImage(lightboxId) {
      let activeImageSrc = $(`#${lightboxId} .lightboxImage`).attr("src");
      let imagesCollection = this.getImagesCollection();
      let activeIndex = imagesCollection.indexOf(activeImageSrc);
      let nextIndex = (activeIndex === imagesCollection.length - 1) ? 0 : activeIndex + 1;
      $(`#${lightboxId} .lightboxImage`).attr("src", imagesCollection[nextIndex]);
    },
    // Fin de la correction de la navigation dans la lightbox

    getImagesCollection() {
      return $(".gallery-item img").map(function() {
        return $(this).attr("src");
      }).get();
    }
  };
})(jQuery);
