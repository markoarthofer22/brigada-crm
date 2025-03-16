<?php

namespace PP\Controller;

use PP\Classes\Database;
use PP\Classes\Dates;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Navigation;
use PP\Classes\Objects;
use PP\Classes\Pages;
use PP\Classes\Prices;
use PP\Classes\Settings\ObjectsObjectsTypes;
use PP\Classes\Settings\Templates;
use PP\Classes\Users;

/**
 * BaseController class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class BaseController
{

	protected $db;

	public function __construct()
	{
		$this->db = Database::Connection($_SESSION["database_suffix"]);
	}

	/**
	 * Render function
	 *
	 * @param string $template
	 * @param array $params
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Render(string $template, array $params): string
	{
		foreach ($params as $key => $value) {
			${$key} = $value;
		}
		ob_start();
		require($template);
		$output = ob_get_clean();
		return $output;
	}
}
