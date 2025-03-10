<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Calculate class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Calculate
{

	protected $database;
	protected $revcost;
	protected $cusType;
	protected $trevcost;
	protected $total_revenue;
	protected $total_cost;
	protected $types_order_revenue;
	protected $types_order_cost;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
		$this->revcost = [
			0 => 'R',
			1 => 'C'
		];
		$this->cusType = [
			0 => 'B2B',
			1 => 'B2C',
			2 => 'TOTAL'
		];
		$this->trevcost = [
			0 => 0.0,
			1 => 0.0
		];
		$this->total_revenue = 0;
		$this->total_cost = 0;
		$this->types_order_revenue = [1, 3, 27, 4];
		$this->types_order_cost = [14, 21, 18, 6, 16, 30, 29, 24, 23, 15, 27, 7, 19, 5, 22, 2, 35, 34, 33, 2, 9, 10, 11, 12, 13, 17, 20, 25, 26, 28, 31, 32];
	}


	/**
	 * Get function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{

		$start_time = microtime(true);


		$Types = new Types($this->database);
		$Products = new Products($this->database);

		$start = date('Y-m-01', strtotime('-28 days'));
		$end = date("Y-m-t", strtotime('-28 days'));
		$dfrom = !empty($params->date_from) ? date("Y-m-d", strtotime($params->date_from)) : $start;
		$dto = !empty($params->date_to) ? date("Y-m-d", strtotime($params->date_to)) : $end;

		$types = $Types->GetAll();
		$products = $Products->GetAll();

		$where = ' 1=1 ';
		$b2c = $params->display && $params->display == "b2bc" ? "cpm.b2bc" : 2;

		// print_r($params);
		// var_dump($params->display);
		// var_dump($params->display == "b2bc");
		// var_dump($b2c);
		// exit;

		$table = "{$_SESSION["SCHEMA"]}.mcpm";
		if (!$params->ytd) {
			$where .= "AND cpm.date BETWEEN '{$dfrom}' AND '{$dto}' AND cpm.ytd = false ";
		} else {
			$where .= "AND cpm.date BETWEEN '{$dfrom}' AND '{$dto}' /*AND cpm.source_id <> (SELECT id FROM cpm.sources WHERE name = 'AVERAGE' LIMIT 1)*/ ";
		}

		if ($params->customerno) {
			$where .= "AND cpm.cust = '{$params->customerno}' ";
		}

		if (!$params->import) {
			$where .= "AND cpm.cust IS NOT NULL AND cpm.cust > '17500000000100000' ";
		}

		$staticCols = 14;
		$endCols = 5;
		$totalCols = $staticCols;
		$startCols = $staticCols - $endCols;
		$total = [];

		$sql = "SELECT 
					t.name, 
					cpm.revcost 
				FROM {$table} cpm
				JOIN cpm.types t ON t.id = cpm.type
				WHERE
				{$where}
				GROUP BY t.name, cpm.revcost
				ORDER BY cpm.revcost, t.name
		";
		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		$column_types = [];
		foreach ($results as $result) {
			$column_types[] = [
				'type' => trim($result->name),
				'revcost' => $result->revcost
			];
		}

		$sql = "SELECT
					cpm.cust::TEXT,
					pr.short as prod,
					{$b2c} as b2bc,
					t.name as type, 
					SUM(cpm.val) as val,
					cpm.revcost, 
					SUM(cpm.count) as count,
					SUM(cpm.weight) as weight,
					MAX(s.name) as rep,
					MAX(sc.name) as channel,
					BOOL_OR(s.is_new) as is_new,
					MAX(c.name) as customer_name
				FROM {$table} cpm
				JOIN cpm.types t ON t.id = cpm.type
				JOIN cpm.products pr ON pr.id = cpm.prod
				LEFT JOIN cpm.sales_person s ON s.customerno = cpm.cust
				LEFT JOIN cpm.sales_title st ON st.title_id = s.title_id
				LEFT JOIN cpm.sales_type sc ON sc.id = st.type_id
				LEFT JOIN cpm.customers c ON c.customerno::varchar = cpm.cust::varchar
				WHERE
					{$where}
					-- and ( 
					-- 	cpm.tax_number = '00164260309' or cpm.cust = '17500000006030159' 
					-- )
				GROUP BY cpm.cust, pr.short, t.name, cpm.revcost, {$b2c}
				ORDER BY cpm.cust, pr.short, b2bc, cpm.revcost, t.name
				-- LIMIT 1000
		";

		if ($params->group) {
			$sql = "SELECT
						MAX(CASE WHEN cpm.tax_number IS NOT NULL AND cpm.tax_number != '0' THEN cpm.tax_number ELSE cpm.cust::varchar END)::TEXT as cust,
						pr.short as prod,
						{$b2c} as b2bc,
						t.name as type, 
						SUM(cpm.val) as val,
						cpm.revcost, 
						SUM(cpm.count) as count,
						SUM(cpm.weight) as weight,
						MAX(s.name) as rep,
						MAX(sc.name) as channel,
						BOOL_OR(s.is_new) as is_new,
						STRING_AGG(distinct cpm.cust::varchar, ', ') as all_custs,
						STRING_AGG(DISTINCT CASE WHEN cpm.tax_number IS NOT NULL AND cpm.tax_number != '0' THEN cpm.tax_number ELSE cpm.cust::varchar END, ', ')::TEXT AS tax_number,
						MAX(c.name) as customer_name
					FROM {$table} cpm
					JOIN cpm.types t ON t.id = cpm.type
					JOIN cpm.products pr ON pr.id = cpm.prod
					LEFT JOIN cpm.sales_person s ON s.customerno = cpm.cust
					LEFT JOIN cpm.sales_title st ON st.title_id = s.title_id
					LEFT JOIN cpm.sales_type sc ON sc.id = st.type_id
					LEFT JOIN cpm.customers c ON c.customerno::varchar = cpm.cust::varchar
					WHERE
						{$where}
						AND s.tax_number IS NOT NULL
						AND TRIM(s.tax_number) <> ''
						-- and cpm.cust = '17500000006030284'
						-- and ( 
						-- 	cpm.tax_number = '00164260309' or cpm.cust = '17500000006248984' 
						-- )
					GROUP BY CASE WHEN cpm.tax_number IS NOT NULL AND cpm.tax_number != '0' THEN cpm.tax_number ELSE cpm.cust::varchar END, pr.short, t.name, cpm.revcost, {$b2c}

					UNION 

					SELECT
						MAX(cpm.cust)::TEXT as cust,
						pr.short as prod,
						{$b2c} as b2bc,
						t.name as type, 
						SUM(cpm.val) as val,
						cpm.revcost, 
						SUM(cpm.count) as count,
						SUM(cpm.weight) as weight,
						MAX(s.name) as rep,
						MAX(sc.name) as channel,
						BOOL_OR(s.is_new) as is_new,
						STRING_AGG(distinct cpm.cust::varchar, ', ')::TEXT as all_custs,
						STRING_AGG(DISTINCT CPM.TAX_NUMBER::varchar, ', ')::TEXT AS tax_number,
						MAX(c.name) as customer_name
					FROM {$table} cpm
					JOIN cpm.types t ON t.id = cpm.type
					JOIN cpm.products pr ON pr.id = cpm.prod
					LEFT JOIN cpm.sales_person s ON s.customerno = cpm.cust
					LEFT JOIN cpm.sales_title st ON st.title_id = s.title_id
					LEFT JOIN cpm.sales_type sc ON sc.id = st.type_id
					LEFT JOIN cpm.customers c ON c.customerno::varchar = cpm.cust::varchar
					WHERE
						{$where}
						AND (
							s.tax_number IS NULL
							OR TRIM(s.tax_number) = ''
						)
						-- and ( 
						-- 	cpm.tax_number = '00164260309' or cpm.cust = '17500000006248984' 
						-- )
					GROUP BY cpm.cust, pr.short, t.name, cpm.revcost, {$b2c}
					ORDER BY cust, prod, b2bc, revcost, type
					-- LIMIT 10000 OFFSET 0
			";
		}

		// echo $sql;
		// exit;

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		$output = array();
		// $output["types"] = $types;

		// var_dump($results);
		// exit;

		// echo "<pre>";

		// $start_time_total = microtime(true);
		foreach ($results as $result) {


			$key = "{$result->cust}-{$result->prod}-{$this->cusType[$result->b2bc]}";
			$output_data = &$output[$key];

			if ($result->cust == 0 || $result->cust == "" || $result->cust == "00" || $result->cust == "000" || $result->cust == "0000") {
				$result->cust = explode(",", $result->all_custs)[0];
			}

			$output_data["customerno"] = $params->group ? $result->all_custs : $result->cust;

			// $start_time = microtime(true);
			// print_r($result);
			// exit;
			// $output_data["customer"] = $Customers->Get($result->cust);
			$output_data["customer"] = $result->customer_name;
			// $end_time = microtime(true);
			// echo "Executed in: " . $end_time - $start_time . " seconds<br>";

			$output_data["rep"] = $result->rep;
			$output_data["channel"] = $result->channel;
			$output_data["prod"] = $result->prod;
			$output_data["cusType"] = $this->cusType[$result->b2bc];
			$output_data["count"] = $result->count > $output_data["count"] ? $result->count * 1 : $output_data["count"];
			$output_data["weight"] = $result->weight > $output_data["weight"] ? $result->weight * 1 : $output_data["weight"];

			// revenue i cost koji imamo
			foreach ($column_types as $column_type) {
				if ($column_type['type'] == $result->type && $column_type['revcost'] == $result->revcost) {
					$total[$this->revcost[$result->revcost]][$result->type] += $result->val;
					$val = number_format($result->val, 5, ',', '.');

					$filtered = current(array_filter($types, function ($item) use ($result) {
						return $item->name === $result->type;
					}));
					$output_data[$this->revcost[$result->revcost]][$filtered->id] = ["id" => $filtered->id, "value" => $val]; //$val;
					// $output_data[$this->revcost[$result->revcost]][] = ["id" => $filtered->id, "value" => $val];
					$output_data["total"][$this->revcost[$result->revcost]][$filtered->id] += $result->val;
				}
			}

			// revenue i cost koji nemamo setiramo na 0
			foreach ($column_types as $column_type) {
				$filtered = current(array_filter($types, function ($item) use ($column_type) {
					return $item->name === $column_type["type"];
				}));

				if (!isset($output_data[$this->revcost[$column_type["revcost"]]][$filtered->id])) {
					$output_data[$this->revcost[$column_type["revcost"]]][$filtered->id] = ["id" => $filtered->id, "value" => "0,00000"]; // "0,00000";
					// $output_data[$this->revcost[$column_type["revcost"]]][] = ["id" => $filtered->id, "value" => "0,00000"];
				}
			}

			$output_data["tr"] = isset($output_data["total"]["R"]) ? array_reduce($output_data["total"]["R"], function ($carry, $item) {
				return $carry + $item;
			}, 0) : 0;
			$output_data["tc"] = isset($output_data["total"]["C"]) ? array_reduce($output_data["total"]["C"], function ($carry, $item) {
				return $carry + $item;
			}, 0) : 0;
			$output_data["total_revenue"] = number_format($output_data["tr"], 5, ",", ".");
			$output_data["total_cost"] = number_format($output_data["tc"], 5, ",", ".");

			$gmargin = empty($output_data["tr"]) ? '0,00' : number_format(($output_data["tr"] - $output_data["tc"]) / $output_data["tr"] * 100, 5, ',', '.');
			$rpp = number_format($output_data["tr"] / max($output_data["count"], 1), 5, ',', '.');
			$cpp = number_format($output_data["tc"] / max($output_data["count"], 1), 5, ',', '.');
			$wpp = number_format($output_data["weight"] / max($output_data["count"], 1), 5, ',', '.');

			$output_data["gmargin"] = $gmargin . "%";
			$output_data["rpp"] = $rpp;
			$output_data["cpp"] = $cpp;
			$output_data["wpp"] = $wpp;
			$output_data["_temp"]["1.total_revenue"] = $output_data["total_revenue"];
			$output_data["_temp"]["1.tr"] = $output_data["tr"];
			$output_data["_temp"]["2.total_cost"] = $output_data["total_cost"];
			$output_data["_temp"]["2.tc"] = $output_data["tc"];

			// $output_data["R"] = array_values($output_data["R"]);
			// $output_data["C"] = array_values($output_data["C"]);
			// print_r($output_data);
			// exit;
		}

		// $end_time_total = microtime(true);
		// echo "<hr>Executed in: " . $end_time_total - $start_time_total . " seconds";

		// exit;

		foreach ($column_types as $column_type) {

			$filtered = current(array_filter($types, function ($item) use ($column_type) {
				return $item->name === $column_type["type"];
			}));

			$val = number_format(array_reduce(
				array_map(function ($entry) use ($column_type, $filtered) {
					return isset($entry["total"][$this->revcost[$column_type["revcost"]]][$filtered->id]) ? $entry["total"][$this->revcost[$column_type["revcost"]]][$filtered->id] : "0,00000";
				}, $output),
				function ($carry, $item) {
					return $carry + $item;
				},
				0
			), 5, ",", ".");

			$output["total"][$this->revcost[$column_type["revcost"]]][$filtered->id] = ["id" => $filtered->id, "value" => $val];
		}

		$output["total"]["total_revenue"] = number_format(array_sum(array_column($output, 'tr')), 5, ",", ".");
		$output["total"]["total_cost"] = number_format(array_sum(array_column($output, 'tc')), 5, ",", ".");

		// sort arraya, fix array valuesa, change associative to non associative arrays
		// rename of some nodes etc...
		foreach ($output  as $key => &$value) {
			if ($key !== 'total') {
				unset($value['total']);
				unset($value['tr']);
				unset($value['tc']);

				try {
					usort($value["R"], function ($a, $b) {
						$orderA = array_search($a['id'], $this->types_order_revenue);
						$orderB = array_search($b['id'], $this->types_order_revenue);
						return $orderA - $orderB;
					});
					usort($value["C"], function ($a, $b) {
						$orderA = array_search($a['id'], $this->types_order_cost);
						$orderB = array_search($b['id'], $this->types_order_cost);
						return $orderA - $orderB;
					});
					$value["revenue"] = $value["R"];
					$value["cost"] = $value["C"];
					unset($value['R']);
					unset($value['C']);
				} catch (\Throwable $th) {
					$value["revenue"] = 0;
					$value["cost"] = 0;
				}
			}

			if ($key === "total") {
				try {
					usort($value["R"], function ($a, $b) {
						$orderA = array_search($a['id'], $this->types_order_revenue);
						$orderB = array_search($b['id'], $this->types_order_revenue);
						return $orderA - $orderB;
					});
					usort($value["C"], function ($a, $b) {
						$orderA = array_search($a['id'], $this->types_order_cost);
						$orderB = array_search($b['id'], $this->types_order_cost);
						return $orderA - $orderB;
					});
					$value["revenue"] = $value["R"];
					$value["cost"] = $value["C"];
					unset($value['R']);
					unset($value['C']);
				} catch (\Throwable $th) {
					$value["revenue"] = 0;
					$value["cost"] = 0;
				}
			}
		}

		// making proper output with non associative arrays
		$_total = $output["total"];
		unset($output["total"]);
		$_data = array_values($output);

		return array("total" => $_total, "data" => $_data);
	}
}
