<?php

namespace PP\Classes;

use PDO;
use stdClass;

/**
 * Language class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Language
{

	protected $db;
	protected $database;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		// $this->db = Database::Connection();
		$this->database = $db;
	}

	/**
	 * GetAllLanguages function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAllLanguages(): array
	{
		$iniFiles = glob(__DIR__ . '/../lang/*.ini');
		$names = array();

		if ($iniFiles !== false) {
			foreach ($iniFiles as $file) {
				$filename = basename($file);
				$nameWithoutExtension = pathinfo($filename, PATHINFO_FILENAME);
				$names[] = $nameWithoutExtension;
			}
		}

		return $names;
	}

	/**
	 * PrepareWords function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function PrepareWords(): array
	{

		$file = __DIR__ . "/../lang/{$_SESSION['lang']}.ini";
		$iniData = parse_ini_file($file, true);

		$translations = array();

		foreach ($iniData as $section => $values) {
			foreach ($values as $key => $value) {
				$translations[$section][$key] = $value;
			}
		}

		return $translations;
	}

	/**
	 * Translate function
	 *
	 * @param array $params
	 * @return string
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Translate(array $params): string
	{
		if (array_key_exists("node", $params) && array_key_exists("phrase", $params)) {
			$file = __DIR__ . "/../lang/{$_SESSION['lang']}.ini";
			$iniData = parse_ini_file($file, true);
			$translations = array();
			foreach ($iniData as $section => $values) {
				foreach ($values as $key => $value) {
					$translations[$section][$key] = $value;
				}
			}
			return $translations[$params["node"]][$params["phrase"]] ? $translations[$params["node"]][$params["phrase"]] : $params["phrase"];
		} else {
			return $params["phrase"];
		}
	}
}
