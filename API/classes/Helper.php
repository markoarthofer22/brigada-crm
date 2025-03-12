<?php

namespace PP\Classes;

use Shuchkin\SimpleXLSXGen;
use stdClass;
use PDO;

/**
 * Helper class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Helper
{

	protected $db;
	protected $database;
	protected $temp_folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		// $this->db = Database::Connection();
		$this->database = $db;
		$this->temp_folder = "../files/temp";
	}

	/**
	 * ArrayToObject function
	 *
	 * @param array $array
	 * @return object
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function ArrayToObject($array = array()): object
	{
		$obj = new stdClass;

		foreach ($array as $key => $value) {
			if (strlen($key)) {
				if (is_array($value) && $key !== "values" && $key !== "available_values") {
					$obj->{$key} = $this->ArrayToObject($value);
				} else {
					$obj->{$key} = $value;
				}
			}
		}
		return $obj;
	}

	/**
	 * GUID function
	 *
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GUID(): string
	{
		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', \mt_rand(0, 65535), \mt_rand(0, 65535), \mt_rand(0, 65535), \mt_rand(16384, 20479), \mt_rand(32768, 49151), \mt_rand(0, 65535), \mt_rand(0, 65535), \mt_rand(0, 65535));;
	}

	/**
	 * Filesize function
	 *
	 * @param integer $bytes
	 * @param integer $decimals
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Filesize(int $bytes, int $decimals = 2): string
	{
		$factor = floor((strlen($bytes) - 1) / 3);
		if ($factor > 0) {
			$sz = 'KMGT';
		}
		return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor - 1] . 'B';
	}

	/**
	 * formatBytes function
	 *
	 * @param integer $bytes
	 * @param integer $precision
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function formatBytes($bytes, $precision = 2)
	{
		$units = ['B', 'KB', 'MB', 'GB', 'TB'];

		$bytes = max($bytes, 0);
		$pow = floor(($bytes ? log($bytes) : 0) / log(1024));
		$pow = min($pow, count($units) - 1);

		// Calculate the bytes for the given unit
		$bytes /= pow(1024, $pow);

		return round($bytes, $precision) . ' ' . $units[$pow];
	}
}
