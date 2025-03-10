<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Linehaul class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Linehaul
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
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{

		$sql = "SELECT 
					*
				FROM {$_SESSION["SCHEMA"]}.linehaul_route_mapping t
				ORDER by t.id
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}

	/**
	 * Insert function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Insert(object $params): bool
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.linehaul_route_mapping 
				(route_id, sdepo, rdepo, percent) 
				VALUES 
				(:ROUTE_ID, :SDEPO, :RDEPO, :PERCENT)
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ROUTE_ID', $params->route_id, PDO::PARAM_INT);
		$stmt->bindParam(':SDEPO', $params->sdepo, PDO::PARAM_STR);
		$stmt->bindParam(':RDEPO', $params->rdepo, PDO::PARAM_STR);
		$stmt->bindParam(':PERCENT', $params->percent, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}

	/**
	 * Update function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.linehaul_route_mapping
				SET 
					route_id = :ROUTE_ID,
					sdepo = :SDEPO,
					rdepo = :RDEPO,
					percent = :PERCENT
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ROUTE_ID', $params->route_id, PDO::PARAM_INT);
		$stmt->bindParam(':SDEPO', $params->sdepo, PDO::PARAM_STR);
		$stmt->bindParam(':RDEPO', $params->rdepo, PDO::PARAM_STR);
		$stmt->bindParam(':PERCENT', $params->percent, PDO::PARAM_INT);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}

	/**
	 * Delete function
	 *
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(object $params): bool
	{

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.linehaul_route_mapping 
				WHERE id = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->args->id, PDO::PARAM_INT);
		$stmt->execute();

		return true;
	}

	/**
	 * GetAverage function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAverage(object $params): array
	{


		$dateStart = ($_REQUEST['download'] == 'true') ? date('Y-m-d', strtotime(substr($_REQUEST['dateStart'], 0, strpos($_REQUEST['dateStart'], 'GMT')))) : $_REQUEST['dateStart'];
		$dateEnd = ($_REQUEST['download'] == 'true') ? date('Y-m-d', strtotime(substr($_REQUEST['dateEnd'], 0, strpos($_REQUEST['dateEnd'], 'GMT')))) : $_REQUEST['dateEnd'];

		$date_from = date('Y-m-d', strtotime($params->query->date_from));
		$date_to = date('Y-m-d', strtotime($params->query->date_to));

		$period = ' p.date ';
		if ($params->query->type == 'avg') {
			$period = " to_char(date_trunc('month', p.date), 'YYYY-MM') ";
		}

		$routeJoin = '';
		$where = '';
		if ($params->query->linehaul == 'exp') {
			$name = 'm.ident';
			$routeJoin = "JOIN {$_SESSION["SCHEMA"]}.linehaul_exp m ON m.id::varchar = p.setting_id";
		} else {
			$name = 'r.name';
			$routeJoin = "
				JOIN {$_SESSION["SCHEMA"]}.linehaul_route_mapping m ON m.id::varchar = p.mapping_id
				JOIN {$_SESSION["SCHEMA"]}.linehaul_routes r ON r.id = m.route_id
			";
			$where = " AND p.source_id = 5 ";
		}

		if (!empty($params->query->route) && $params->query->route != '0') {
			$where .= " AND {$name} = '{$params->query->route}' ";
		}

		$sql = "SELECT 
					{$name} AS name,
					m.sdepo,
					m.rdepo,
					CONCAT(AVG(m.percent)::numeric(10,2), '%') as percent,
					w.id,
					w.name as weight,
					ROUND(AVG(p.amount), 3) as cost,
					COUNT(DISTINCT(p.parcelno)) AS parcels,
					{$period} AS period
				FROM {$_SESSION["SCHEMA"]}.parcels p
				{$routeJoin}
				JOIN {$_SESSION["SCHEMA"]}.linehaul_weight_groups w ON w.id::varchar = p.wgroup
				WHERE
					p.date BETWEEN '{$date_from}' AND '{$date_to}'
					{$where}
				GROUP BY period, {$name}, m.sdepo, m.rdepo, w.id, w.name
				ORDER BY period, {$name}, m.sdepo, m.rdepo
		";

		// echo "<pre>";
		// echo $sql;
		// exit;

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_OBJ);

		return $results;
	}
}
