<?php

namespace PP\Classes;

use DateTime;
use Exception;
use PDO;
use stdClass;

/**
 * Test class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Test
{

	protected $database;
	protected $database_local;
	protected $local_table_suffix;

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

	public function PP()
	{
		$Helper = new Helper($this->database);
		$Country = new Country($this->database);

		// $sql = "SELECT * FROM price_calculator.country ORDER BY country_name;";
		// $stmt = $this->database->prepare($sql);
		$stmt->execute();
		// $results = $stmt->fetchAll(PDO::FETCH_OBJ);

		// $formats = array();

		// echo "<pre>";
		// foreach ($results as $result) {
		// 	$params = new stdClass;
		// 	$params->id = $result->id;
		// 	$result->format_r = $Country->GetFormat($params);
		// 	$result->format = $result->format_r["format"];
		// 	$formats[] = $result->format;
		// 	// print_r($result);
		// }

		// print_r($formats);

		$formats  = [
			"NNNN",
			"NNNNN",
			"AANNN|NNN",
			"",
			"NNNN|BNNNNBBB|BNNNN",
			"AANNNN|NNNN",
			"NNN",
			"AANNNNN",
			"NNNNNN",
			"AANN",
			"NNNNNNN",
			"NNNNNOOO|NNNNN",
			"NNNNN",
			"NNNN|AANNNN",
			"NNN|NNNBBO|NNNBBOO|NNNBBOOO|NNNBBOOOO",
			"AANNNN|NNNN",
			"NNNNN",
			"NNNNNNN",
			"NNNNNNOOOOO|NNNNN",
			"N|A??????",
			"NNNNN|NNNNNNN",
			"ANNAA|A??NAA|AAN?NAA",
			"NNNN",
			"AANNNNN",
			"ANANAN",
			"NNNNN|NNNNN",
			"NNNNNNN|NNNNNNOOO",
			"BBNNNN|NNNN",
			"NNNNOOOO|NNNN",
			"BBNNNNN|NNNNN",
			"AAANNNN",
			"NNNNNN",
			"ANNNN|NNNNN",
			"NNNNNNN",
			"NNNNNAA"
		];


		exit;
	}
}
