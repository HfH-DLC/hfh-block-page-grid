<?php

namespace HfH;

use WP_Query;

/**
 * Plugin Name:       HfH Page Grid
 * Description:       Block that displays a grid of page teasers.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       hfh-page-grid
 *
 * @package           hfh/page-grid
 */

class Page_Grid
{
	static $instance = false;

	public static function getInstance()
	{
		if (!self::$instance)
			self::$instance = new self;
		return self::$instance;
	}

	private function __construct()
	{
		add_action('init', array($this, 'init'));
	}

	public function init()
	{
		register_block_type(__DIR__ . '/build', array(
			'render_callback' => array($this, 'render_callback'),
			'attributes' => array(
				'selectedPages' => array(
					'type' => 'array'
				)
			)
		));
	}

	public function render_callback($block_attributes, $content)
	{
		$pages = $block_attributes['selectedPages'];
		$alignwide = $block_attributes['align'] === "wide";
		$query = new WP_Query(array(
			'post_type' => 'page',
			'posts_per_page' => -1,
			'post__in' => $pages,
			'orderby' => 'post__in'
		));
		if ($query->have_posts()) :
			ob_start();
?>
			<div class="hfh-page-grid full-width <?php if ($alignwide) : ?>alignwide<?php endif; ?>">
				<?php
				while ($query->have_posts()) :
					$query->the_post();
				?>
					<div class="hfh-page-grid__column">
						<div class="hfh-page-grid__teaser">
							<article>
								<a class="hfh-page-grid__link" href="<?php the_permalink(); ?>">
									<div class="hfh-page-grid__image">
										<?php if (has_post_thumbnail()) : ?>
											<?php the_post_thumbnail(); ?>
										<?php endif; ?>
									</div>
									<div class="hfh-page-grid__text">
										<div class="hfh-page-grid__title">
											<?php the_title(); ?>
										</div>
										<div class="hfh-page-grid__excerpt">
											<?php the_excerpt(); ?>
										</div>
										<div class="hfh-page-grid__arrow">
											<svg width='47px' height='20px' viewBox='0 0 47 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
												<g transform='translate(0.000000, 1.000000)' stroke='currentColor' stroke-width='2' fill='none' fill-rule='evenodd'>
													<line x1='45' y1='9' x2='-1.19015908e-13' y2='9'></line>
													<polyline points='36.5 0 45 9 36.5 18'></polyline>
												</g>
											</svg>
										</div>
									</div>
								</a>
							</article><!-- #post-<?php the_ID(); ?> -->
						</div>
					</div>
				<?php
				endwhile;
				?>
			</div>
<?php
			$output = ob_get_clean();
			wp_reset_postdata();
		endif;
		return $output;
	}
}

Page_Grid::getInstance();
