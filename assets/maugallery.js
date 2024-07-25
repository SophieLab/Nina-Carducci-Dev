(function($) {
  $.fn.mauGallery = function(options) {
    var settings = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      var $gallery = $(this);
      
      // Crée le conteneur de lignes si nécessaire
      $.fn.mauGallery.methods.createRowWrapper($gallery);
      
      // Crée la lightbox si l'option est activée
      if (settings.lightBox) {
        $.fn.mauGallery.methods.createLightBox($gallery, settings.lightboxId, settings.navigation);
      }
      
      // Configure les écouteurs d'événements
      $.fn.mauGallery.listeners(settings);

      // Traite chaque élément de la galerie
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

      // Affiche les tags si l'option est activée
      if (settings.showTags) {
        $.fn.mauGallery.methods.showItemTags($gallery, settings.tagsPosition, tagsCollection);
      }

      // Affiche la galerie
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

  $.fn.mauGallery.listeners = function(settings) {
    $(document).on("click", ".gallery-item", function() {
      if (settings.lightBox && $(this).is("img")) {
        $.fn.mauGallery.methods.openLightBox($(this), settings.lightboxId);
      }
    });

    $(document).on("click", ".nav-link", function() {
      $(".nav-link").removeClass("active"); // Supprimer la classe active de tous les liens de navigation
      $(this).addClass("active"); // Ajouter la classe active au lien de navigation cliqué
      $.fn.mauGallery.methods.filterByTag.call(this); // Assurez-vous que `filterByTag` utilise `this` correctement
    });

    $(document).on("click", ".mg-prev", () => 
      $.fn.mauGallery.methods.prevImage(settings.lightboxId) // Correction : utilisation de prevImage() pour la navigation précédente
    );
    $(document).on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(settings.lightboxId) // Correction : utilisation de nextImage() pour la navigation suivante
    );
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
    
    prevImage(lightboxId) {
      let activeImageSrc = $(`#${lightboxId} .lightboxImage`).attr("src");
      let imagesCollection = this.getImagesCollection(); // Utilisation de la méthode pour obtenir les images visibles
      let currentIndex = imagesCollection.findIndex(img => img.attr("src") === activeImageSrc); // Trouver l'index de l'image active
      let prevIndex = (currentIndex > 0) ? currentIndex - 1 : imagesCollection.length - 1; // Calculer l'index de l'image précédente
      $(`#${lightboxId} .lightboxImage`).attr("src", imagesCollection[prevIndex].attr("src"));
    },
    
    nextImage(lightboxId) {
      let activeImageSrc = $(`#${lightboxId} .lightboxImage`).attr("src");
      let imagesCollection = this.getImagesCollection(); // Utilisation de la méthode pour obtenir les images visibles
      let currentIndex = imagesCollection.findIndex(img => img.attr("src") === activeImageSrc); // Trouver l'index de l'image active
      let nextIndex = (currentIndex < imagesCollection.length - 1) ? currentIndex + 1 : 0; // Calculer l'index de l'image suivante
      $(`#${lightboxId} .lightboxImage`).attr("src", imagesCollection[nextIndex].attr("src"));
    },
    
    getImagesCollection() {
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      $(".item-column").each(function() {
        let $img = $(this).children("img");
        if (activeTag === "all" || $img.data("gallery-tag") === activeTag) {
          imagesCollection.push($img);
        }
      });
      return imagesCollection;
    },
    
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId || 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;"></span>'}
              <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clic"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;"></span>'}
            </div>
          </div>
        </div>
      </div>`);
    },
    
    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      gallery[position === "bottom" ? 'append' : 'prepend'](tagsRow);
    },
    
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");
      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        var $parentColumn = $(this).parents(".item-column");
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $parentColumn.show(300); // Affiche les colonnes correspondant au tag sélectionné
        } else {
          $parentColumn.hide(); // Masque les colonnes non correspondantes
        }
      });
    }
  };
})(jQuery);
