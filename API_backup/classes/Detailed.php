<?php

namespace PP\Classes;

use Exception;
use PDO;
use PDOException;
use stdClass;

/**
 * Linehaul class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Detailed
{

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
	 * Get function
	 *
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetCount(object $params): int
	{

		$limit = $params->limit;
		$offset = ($params->page - 1) * $limit;

		$date_from = date("Y-m-d", strtotime($params->date_from));
		$date_to = date("Y-m-d", strtotime($params->date_to));

		$what_count = "COUNT(*) AS total_count,
						SUM(
							CASE 
								WHEN a.revcost = 1 THEN a.amount * -1
								ELSE a.amount
							END
						) AS amount,
						SUM(
							CASE 
								WHEN a.prod != '' THEN 
									CASE 
										WHEN ipm.prod_type = 0 THEN 
											CASE 
												WHEN a.count IS NULL THEN 
													CASE 
														WHEN a.revcost = 1 THEN -1 
														ELSE 1 
													END
												ELSE a.count
											END
										ELSE a.count
									END
								ELSE a.count
							END
						) AS count
	 	";
		$what_full = "a.revcost,
						a.parcelno,
						a.date,
						a.customerno::TEXT as customer_id,
						c.name as customer,
						sp.name as salesperson, 
						p.name as product, 
						t.name as type,
						s.name as source, 
						a.prod as it4em_product,
						(CASE WHEN a.prod != '' THEN CASE WHEN ipm.prod_type = 0 THEN 'main' ELSE 'additional' END ELSE '' END) as it4em_product_type,
						(CASE WHEN a.revcost = 1 THEN a.amount * -1 ELSE a.amount END) as amount,
						a.depo as depot, 
						a.tour,
						a.sender_zip as szip,
						sc.country_name as scountry,
						a.receiver_zip as rzip,
						rc.country_name as rcountry,
						a.b2bc,
						a.weight as weight,
						a.preinvoice as preinvoice,
						(CASE 
							WHEN a.prod != '' THEN 
								(CASE 
									WHEN ipm.prod_type = 0 THEN 
										(CASE 
											WHEN a.count IS NULL THEN 
												(CASE WHEN a.revcost = 1 THEN -1 ELSE 1 END)
											ELSE a.count
										END)
									ELSE a.count
								END)
							ELSE a.count 
						END) as count
		";

		$where = " WHERE a.date BETWEEN '{$date_from}' AND '{$date_to}' ";
		$order_by = "ORDER BY a.id";
		$group_by = "";
		$customerno = "";
		$parcelno = "";
		$depot = "";
		$tour = "";
		$product_id = "";
		$type_id = "";
		$source_id = "";
		$revcost = "";
		$preinvoice = "";
		$sales_id = "";
		$scountry = "";
		$rcountry = "";
		$it4em_product = "";
		$it4em_type = "";

		if (!empty($params->customerno)) {
			$customerno .= " AND a.customerno = '{$params->customerno}'";
		}
		if (!empty($params->parcelno)) {
			$parcelno .= " AND a.parcelno = '{$params->parcelno}'";
		}
		if (!empty($params->depot) && is_array($params->depot)) {
			$depot .= "AND a.depo IN ('" . implode("','", array_map('intval', (array)$params->depot)) . "')";
		}
		if (!empty($params->tour) && is_array($params->tour)) {
			$tour .= "AND a.tour IN ('" . implode("','", array_map('intval', (array)$params->tour)) . "')";
		}
		if (!empty($params->product_id) && is_array($params->product_id)) {
			$product_id .= "AND a.product_id IN (" . implode(",", array_map('intval', (array)$params->product_id)) . ")";
		}
		if (!empty($params->type_id) && is_array($params->type_id)) {
			$type_id .= "AND a.type_id IN (" . implode(",", array_map('intval', (array)$params->type_id)) . ")";
		}
		if (!empty($params->source_id) && is_array($params->source_id)) {
			$source_id .= "AND a.source_id IN (" . implode(",", array_map('intval', (array)$params->source_id)) . ")";
		}
		if (isset($params->revcost) && in_array($params->revcost, ['0', '1', 0, 1], true)) {
			$revcost = "AND a.revcost = {$params->revcost}";
		}
		if (!empty($params->preinvoice)) {
			$preinvoice = $params->preinvoice == 1 ? "AND a.preinvoice IS NOT NULL" : "AND a.preinvoice IS NULL";
		}
		if (!empty($params->sales_id)) {
			$sales_id = "AND sp.person_id = {$params->sales_id}";
		}
		if (!empty($params->scountry) && is_array($params->scountry)) {
			$scountry .= "AND a.scountry IN ('" . implode("','", array_map('intval', (array)$params->scountry)) . "')";
		}
		if (!empty($params->rcountry) && is_array($params->rcountry)) {
			$rcountry .= "AND a.rcountry IN ('" . implode("','", array_map('intval', (array)$params->rcountry)) . "')";
		}
		if (!empty($params->it4em_product) && is_array($params->it4em_product)) {
			$it4em_product = "AND EXISTS (
								SELECT 
									1
								FROM cpm.parcels p
								WHERE 
									p.parcelno = a.parcelno
									AND a.prod IN ('" . implode("','", array_map('intval', (array)$params->it4em_product)) . "')
									AND p.date BETWEEN '{$date_from}' AND '{$date_to}'
								)
			";
			if ($params->it4em_display == '1') {
				$it4em_product = "AND a.prod IN ('" . implode("','", array_map('intval', (array)$params->it4em_product)) . "')";
			}
		}
		if (isset($params->it4em_type) && in_array($params->it4em_type, ['0', '1', 0, 1], true)) {
			$it4em_type = "AND ipm.prod_type = " . (int)$params->it4em_type;
		}


		// Build the SQL query
		$sql_count = "SELECT 
						{$what_count}
					FROM {$_SESSION['SCHEMA']}.parcels a
					LEFT JOIN {$_SESSION['SCHEMA']}.customers c ON c.customerno::bigint = a.customerno
					LEFT JOIN {$_SESSION['SCHEMA']}.sales_person sp ON sp.customerno = a.customerno
					INNER JOIN {$_SESSION['SCHEMA']}.products p ON p.id = a.product_id
					INNER JOIN {$_SESSION['SCHEMA']}.types t ON t.id = a.type_id
					INNER JOIN {$_SESSION['SCHEMA']}.sources s ON s.id = a.source_id
					LEFT JOIN public.country sc ON sc.country_iso_numcode = a.scountry
					LEFT JOIN public.country rc ON rc.country_iso_numcode = a.rcountry
					LEFT JOIN {$_SESSION['SCHEMA']}.it4em_product_mapping ipm ON ipm.prod::text = a.prod

					{$where}
					{$customerno}
					{$parcelno}
					{$depot}
					{$tour}
					{$product_id}
					{$type_id}
					{$source_id}
					{$revcost}
					{$preinvoice}
					{$sales_id}
					{$scountry}
					{$rcountry}
					{$it4em_product}
					{$it4em_type}
		";

		if ($params->group_by && is_array($params->group_by) && !empty($params->group_by)) {
			$select = '';
			$join = '';
			$header = [];
			$group_by = "GROUP BY ";
			$order_by = "ORDER BY ";

			if (in_array('product', $params->group_by)) {
				$select .= "MAX(p.name) as product,";
				$join .= "INNER JOIN cpm.products p ON p.id = a.product_id" . PHP_EOL;
				$group_by .= "a.product_id,";
				$order_by .= "a.product_id,";
				$header['Product'] = 'string';
			}

			if (in_array('source', $params->group_by)) {
				$select .= "MAX(s.name) as source,";
				$join .= "INNER JOIN cpm.sources s ON s.id = a.source_id" . PHP_EOL;
				$group_by .= "a.source_id,";
				$order_by .= "a.source_id,";
				$header['Source'] = 'string';
			}

			if (in_array('type', $params->group_by)) {
				$select .= "MAX(t.name) as type,";
				$join .= "INNER JOIN cpm.types t ON t.id = a.type_id" . PHP_EOL;
				$group_by .= "a.type_id,";
				$order_by .= "a.type_id,";
				$header['Type'] = 'string';
			}

			if (in_array('depot', $params->group_by)) {
				$select .= "MAX(a.depo) as depot,";
				$group_by .= "a.depo,";
				$order_by .= "a.depo,";
				$header['Depot'] = 'string';
			}

			if (in_array('tour', $params->group_by)) {
				$select .= "MAX(a.tour) as tour,";
				$group_by .= "a.tour,";
				$order_by .= "a.tour,";
				$header['Tour'] = 'string';
			}

			$header['Amount'] = 'price';

			$group_by = substr($group_by, 0, -1);
			$order_by = substr($order_by, 0, -1);

			$sql = "SELECT 
						{$select}
						SUM(CASE 
								WHEN a.revcost = 1 THEN a.amount * -1 
								ELSE a.amount 
							END 
						) as amount
					FROM {$_SESSION['SCHEMA']}.parcels a
					{$join}
					WHERE a.date BETWEEN '{$date_from}' AND '{$date_to}'
					{$group_by}
					{$order_by}
			";
		}

		// Set script execution time limit (in seconds)
		$timeout = $limit == 1234567890 ? 600 : 60;
		$dbtimeout = $timeout * 1000;
		$scripttimeout = $timeout * 2;
		set_time_limit($scripttimeout); // Allow up to 120 seconds for the entire script

		// Set a database query timeout (30 seconds in this example)
		$this->database->exec("SET statement_timeout TO {$dbtimeout};"); // Timeout in milliseconds

		// Prepare and execute the statement
		$stmt = $this->database->prepare($sql_count);
		$startTime = microtime(true); // Start tracking execution time
		$stmt->execute(); // Execute the query
		$executionTime = microtime(true) - $startTime; // Check if execution exceeds the timeout
		if ($executionTime > $timeout) { // Timeout in seconds
			throw new Exception("Query execution exceeded the allowed time of {$timeout} seconds.");
		}
		$count = $stmt->fetchObject();

		return $count->total_count;
	}


	/**
	 * Get function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{

		$limit = $params->limit;
		$offset = ($params->page - 1) * $limit;

		$date_from = date("Y-m-d", strtotime($params->date_from));
		$date_to = date("Y-m-d", strtotime($params->date_to));

		// $what_count = "COUNT(*) AS total_count,
		// 				SUM(
		// 					CASE 
		// 						WHEN a.revcost = 1 THEN a.amount * -1
		// 						ELSE a.amount
		// 					END
		// 				) AS amount,
		// 				SUM(
		// 					CASE 
		// 						WHEN a.prod != '' THEN 
		// 							CASE 
		// 								WHEN ipm.prod_type = 0 THEN 
		// 									CASE 
		// 										WHEN a.count IS NULL THEN 
		// 											CASE 
		// 												WHEN a.revcost = 1 THEN -1 
		// 												ELSE 1 
		// 											END
		// 										ELSE a.count
		// 									END
		// 								ELSE a.count
		// 							END
		// 						ELSE a.count
		// 					END
		// 				) AS count
		// ";
		$what_full = "a.revcost,
						a.parcelno,
						a.date,
						a.customerno::TEXT as customer_id,
						c.name as customer,
						sp.name as salesperson, 
						p.name as product, 
						t.name as type,
						s.name as source, 
						a.prod as it4em_product,
						(CASE WHEN a.prod != '' THEN CASE WHEN ipm.prod_type = 0 THEN 'main' ELSE 'additional' END ELSE '' END) as it4em_product_type,
						(CASE WHEN a.revcost = 1 THEN a.amount * -1 ELSE a.amount END) as amount,
						a.depo as depot, 
						a.tour,
						a.sender_zip as szip,
						sc.country_name as scountry,
						a.receiver_zip as rzip,
						rc.country_name as rcountry,
						a.b2bc,
						a.weight as weight,
						a.preinvoice as preinvoice,
						(CASE 
							WHEN a.prod != '' THEN 
								(CASE 
									WHEN ipm.prod_type = 0 THEN 
										(CASE 
											WHEN a.count IS NULL THEN 
												(CASE WHEN a.revcost = 1 THEN -1 ELSE 1 END)
											ELSE a.count
										END)
									ELSE a.count
								END)
							ELSE a.count 
						END) as count
		";

		$where = " WHERE a.date BETWEEN '{$date_from}' AND '{$date_to}' ";
		$order_by = "ORDER BY a.id";
		$group_by = "";
		$customerno = "";
		$parcelno = "";
		$depot = "";
		$tour = "";
		$product_id = "";
		$type_id = "";
		$source_id = "";
		$revcost = "";
		$preinvoice = "";
		$sales_id = "";
		$scountry = "";
		$rcountry = "";
		$it4em_product = "";
		$it4em_type = "";

		if (!empty($params->customerno)) {
			$customerno .= " AND a.customerno = '{$params->customerno}'";
		}
		if (!empty($params->parcelno)) {
			$parcelno .= " AND a.parcelno = '{$params->parcelno}'";
		}
		if (!empty($params->depot) && is_array($params->depot)) {
			$depot .= "AND a.depo IN ('" . implode("','", array_map('intval', (array)$params->depot)) . "')";
		}
		if (!empty($params->tour) && is_array($params->tour)) {
			$tour .= "AND a.tour IN ('" . implode("','", array_map('intval', (array)$params->tour)) . "')";
		}
		if (!empty($params->product_id) && is_array($params->product_id)) {
			$product_id .= "AND a.product_id IN (" . implode(",", array_map('intval', (array)$params->product_id)) . ")";
		}
		if (!empty($params->type_id) && is_array($params->type_id)) {
			$type_id .= "AND a.type_id IN (" . implode(",", array_map('intval', (array)$params->type_id)) . ")";
		}
		if (!empty($params->source_id) && is_array($params->source_id)) {
			$source_id .= "AND a.source_id IN (" . implode(",", array_map('intval', (array)$params->source_id)) . ")";
		}
		if (isset($params->revcost) && in_array($params->revcost, ['0', '1', 0, 1], true)) {
			$revcost = "AND a.revcost = {$params->revcost}";
		}
		if (!empty($params->preinvoice)) {
			$preinvoice = $params->preinvoice == 1 ? "AND a.preinvoice IS NOT NULL" : "AND a.preinvoice IS NULL";
		}
		if (!empty($params->sales_id)) {
			$sales_id = "AND sp.person_id = {$params->sales_id}";
		}
		if (!empty($params->scountry) && is_array($params->scountry)) {
			$scountry .= "AND a.scountry IN ('" . implode("','", array_map('intval', (array)$params->scountry)) . "')";
		}
		if (!empty($params->rcountry) && is_array($params->rcountry)) {
			$rcountry .= "AND a.rcountry IN ('" . implode("','", array_map('intval', (array)$params->rcountry)) . "')";
		}
		if (!empty($params->it4em_product) && is_array($params->it4em_product)) {
			$it4em_product = "AND EXISTS (
								SELECT 
									1
								FROM cpm.parcels p
								WHERE 
									p.parcelno = a.parcelno
									AND a.prod IN ('" . implode("','", array_map('intval', (array)$params->it4em_product)) . "')
									AND p.date BETWEEN '{$date_from}' AND '{$date_to}'
								)
			";
			if ($params->it4em_display == '1') {
				$it4em_product = "AND a.prod IN ('" . implode("','", array_map('intval', (array)$params->it4em_product)) . "')";
			}
		}
		if (isset($params->it4em_type) && in_array($params->it4em_type, ['0', '1', 0, 1], true)) {
			$it4em_type = "AND ipm.prod_type = " . (int)$params->it4em_type;
		}

		// Build the SQL query
		// $sql_count = "SELECT 
		// 					{$what_count}
		// 				FROM {$_SESSION['SCHEMA']}.parcels a
		// 				LEFT JOIN {$_SESSION['SCHEMA']}.customers c ON c.customerno::bigint = a.customerno
		// 				LEFT JOIN {$_SESSION['SCHEMA']}.sales_person sp ON sp.customerno = a.customerno
		// 				INNER JOIN {$_SESSION['SCHEMA']}.products p ON p.id = a.product_id
		// 				INNER JOIN {$_SESSION['SCHEMA']}.types t ON t.id = a.type_id
		// 				INNER JOIN {$_SESSION['SCHEMA']}.sources s ON s.id = a.source_id
		// 				LEFT JOIN public.country sc ON sc.country_iso_numcode = a.scountry
		// 				LEFT JOIN public.country rc ON rc.country_iso_numcode = a.rcountry
		// 				LEFT JOIN {$_SESSION['SCHEMA']}.it4em_product_mapping ipm ON ipm.prod::text = a.prod

		// 				{$where}
		// 				{$customerno}
		// 				{$parcelno}
		// 				{$depot}
		// 				{$tour}
		// 				{$product_id}
		// 				{$type_id}
		// 				{$source_id}
		// 				{$revcost}
		// 				{$preinvoice}
		// 				{$sales_id}
		// 				{$scountry}
		// 				{$rcountry}
		// 				{$it4em_product}
		// 				{$it4em_type}
		// ";
		$sql = "WITH all_data as (
					SELECT 
						{$what_full}
					FROM {$_SESSION['SCHEMA']}.parcels a
					LEFT JOIN {$_SESSION['SCHEMA']}.customers c ON c.customerno::bigint = a.customerno
					LEFT JOIN {$_SESSION['SCHEMA']}.sales_person sp ON sp.customerno = a.customerno
					INNER JOIN {$_SESSION['SCHEMA']}.products p ON p.id = a.product_id
					INNER JOIN {$_SESSION['SCHEMA']}.types t ON t.id = a.type_id
					INNER JOIN {$_SESSION['SCHEMA']}.sources s ON s.id = a.source_id
					LEFT JOIN public.country sc ON sc.country_iso_numcode = a.scountry
					LEFT JOIN public.country rc ON rc.country_iso_numcode = a.rcountry
					LEFT JOIN {$_SESSION['SCHEMA']}.it4em_product_mapping ipm ON ipm.prod::text = a.prod

					{$where}
					{$customerno}
					{$parcelno}
					{$depot}
					{$tour}
					{$product_id}
					{$type_id}
					{$source_id}
					{$revcost}
					{$preinvoice}
					{$sales_id}
					{$scountry}
					{$rcountry}
					{$it4em_product}
					{$it4em_type}

					{$order_by}
				)
				SELECT 
					COUNT(*) as total_count,
					COALESCE(SUM(amount), 0) as amount,
					COALESCE(SUM(count), 0) as count,
					(SELECT json_agg(all_data) FROM (SELECT * FROM all_data LIMIT {$limit} OFFSET {$offset}) all_data) as data
				FROM all_data;
			";

		// echo $sql_count;
		// echo $sql;
		// exit;

		if ($params->group_by && is_array($params->group_by) && !empty($params->group_by)) {
			$select = '';
			$join = '';
			$header = [];
			$group_by = "GROUP BY ";
			$order_by = "ORDER BY ";

			if (in_array('product', $params->group_by)) {
				$select .= "MAX(p.name) as product,";
				$join .= "INNER JOIN cpm.products p ON p.id = a.product_id" . PHP_EOL;
				$group_by .= "a.product_id,";
				$order_by .= "a.product_id,";
				$header['Product'] = 'string';
			}

			if (in_array('source', $params->group_by)) {
				$select .= "MAX(s.name) as source,";
				$join .= "INNER JOIN cpm.sources s ON s.id = a.source_id" . PHP_EOL;
				$group_by .= "a.source_id,";
				$order_by .= "a.source_id,";
				$header['Source'] = 'string';
			}

			if (in_array('type', $params->group_by)) {
				$select .= "MAX(t.name) as type,";
				$join .= "INNER JOIN cpm.types t ON t.id = a.type_id" . PHP_EOL;
				$group_by .= "a.type_id,";
				$order_by .= "a.type_id,";
				$header['Type'] = 'string';
			}

			if (in_array('depot', $params->group_by)) {
				$select .= "MAX(a.depo) as depot,";
				$group_by .= "a.depo,";
				$order_by .= "a.depo,";
				$header['Depot'] = 'string';
			}

			if (in_array('tour', $params->group_by)) {
				$select .= "MAX(a.tour) as tour,";
				$group_by .= "a.tour,";
				$order_by .= "a.tour,";
				$header['Tour'] = 'string';
			}

			$header['Amount'] = 'price';

			$group_by = substr($group_by, 0, -1);
			$order_by = substr($order_by, 0, -1);

			$sql = "WITH all_data AS (
						SELECT 
							{$select}
							SUM(CASE 
									WHEN a.revcost = 1 THEN a.amount * -1 
									ELSE a.amount 
								END 
							) as amount
						FROM {$_SESSION['SCHEMA']}.parcels a
						{$join}
						WHERE a.date BETWEEN '{$date_from}' AND '{$date_to}'
						{$group_by}
						{$order_by}
					)
					SELECT 
						COUNT(*) as total_count,
						COALESCE(SUM(amount), 0) as amount,
						COUNT(*) as count,
						(SELECT json_agg(all_data) FROM (SELECT * FROM all_data) all_data) as data
					FROM all_data;
			";
		}

		// Set script execution time limit (in seconds)
		$timeout = $limit == 1234567890 ? 600 : 60;
		$dbtimeout = $timeout * 1000;
		$scripttimeout = $timeout * 2;
		set_time_limit($scripttimeout); // Allow up to 120 seconds for the entire script

		try {
			// Set a database query timeout (30 seconds in this example)
			$this->database->exec("SET enable_nestloop = OFF;"); // Timeout in milliseconds
			$this->database->exec("SET statement_timeout TO {$dbtimeout};"); // Timeout in milliseconds

			// Prepare and execute the statement
			// $stmt = $this->database->prepare($sql_count);
			// $startTime = microtime(true); // Start tracking execution time
			// $stmt->execute(); // Execute the query
			// $executionTime = microtime(true) - $startTime; // Check if execution exceeds the timeout
			// if ($executionTime > $timeout) { // Timeout in seconds
			// 	throw new Exception("Query execution exceeded the allowed time of {$timeout} seconds.");
			// }
			// $count = $stmt->fetchObject();

			$stmt = $this->database->prepare($sql);
			$startTime = microtime(true); // Start tracking execution time
			$stmt->execute(); // Execute the query
			$executionTime = microtime(true) - $startTime; // Check if execution exceeds the timeout
			if ($executionTime > $timeout) { // Timeout in seconds
				throw new Exception("Query execution exceeded the allowed time of {$timeout} seconds.");
			}
			// $results = $stmt->fetchAll(PDO::FETCH_OBJ);
			$result = $stmt->fetchObject();
			// echo "<pre>";
			// echo $sql;
			// print_r($result);
			// exit;
			$result->data = $result->data ? json_decode($result->data) : array();
			// $results = array_slice($r, $offset, $limit);

			// Handle results as needed
			$output["count"] = $result->total_count;
			$output["limit"] = $limit * 1;
			$output["page"] = $params->page * 1;
			$output["pages"] = ceil($result->total_count / $limit);
			$output["parcels"] =  $result->count ?? 0;
			$output["amount"] =  $result->amount ?? 0;
			$output["item_count_info"] =  ($params->page * $limit >= $result->total_count ? $result->total_count : $params->page * $limit) . " / {$result->total_count}";
			$output["results"] = $result->data;
			$output["_debug"]["sql"] = preg_replace('/\s+/', ' ', $sql);

			// echo $params->page . "<br>";
			// echo $limit . "<br>";
			// echo $params->page * $limit . "<br>";
			// echo $count->total_count . "<br>";
			// echo ($params->page * $limit >= $count->total_count ? $count->total_count : $params->page * $limit) . " / {$count->total_count}<br>";
			// exit;

			return $output;
		} catch (PDOException $e) {
			$this->database->exec("SET statement_timeout TO 0;");
			return array("Error" => "Database error: " . $e->getMessage());
		} catch (Exception $e) {
			// Handle other errors, including timeouts
			$this->database->exec("SET statement_timeout TO 0;");
			return array("Error" => $e->getMessage());
		}
	}
}
