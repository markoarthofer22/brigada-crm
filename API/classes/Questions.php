<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Questions class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Questions
{

	protected $database;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
	}

	/**
	 * GetAll function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(): array
	{
		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.questions q
				ORDER BY q.order ASC, q.label ASC
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["possible_answers"] = json_decode($result["possible_answers"]);
		}
		return $results;
	}

	/**
	 * Get function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.questions q WHERE q.id_questions = :ID";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["possible_answers"] = json_decode($result["possible_answers"]);
		}

		return $result ?: [];
	}


	/**
	 * Add function
	 *
	 * @param object $params
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Add(object $params): int
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.questions 
					(id_projects,label,id_questions_types,possible_answers,order) 
				VALUES 
					(:ID_PROJECTS,:LABEL,:ID_QUESTIONS_TYPES,:POSSIBLE_ANSWERS,:ORDER)
				RETURNING id_questions
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':LABEL', $params->label);
		$stmt->bindParam(':ID_QUESTIONS_TYPES', $params->id_questions_types);
		$stmt->bindParam(':POSSIBLE_ANSWERS', json_encode($params->possible_answers));
		$stmt->bindParam(':ORDER', $params->order);
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return (int)$result['id_questions'];
	}

	/**
	 * Update function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.questions 
				SET 
					id_projects = :ID_PROJECTS,
					label = :LABEL,
					id_questions_types = :ID_QUESTIONS_TYPES,
					possible_answers = :POSSIBLE_ANSWERS,
					order = :ORDER
				WHERE id_questions = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':LABEL', $params->label);
		$stmt->bindParam(':ID_QUESTIONS_TYPES', $params->id_questions_types);
		$stmt->bindParam(':POSSIBLE_ANSWERS', json_encode($params->possible_answers));
		$stmt->bindParam(':ORDER', $params->order);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * Order function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Order(object $params): bool
	{


		$params->id_questions =  implode(',', json_decode(json_encode($params->id_questions), true));

		$sql = "WITH custom_order(id_questions, new_order) AS (
					SELECT id_questions::INTEGER, ord
					FROM unnest(ARRAY[{$params->id_questions}]) WITH ORDINALITY AS t(id_questions, ord)
				)
				UPDATE brigada.questions q
					SET \"order\" = c.new_order
				FROM custom_order c
				WHERE q.id_questions = c.id_questions
				AND q.id_projects = :ID_PROJECTS;
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->execute();

		return true;
	}


	/**
	 * Delete function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(object $params): bool
	{
		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.questions 
				WHERE id_questions = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * GetTypes function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetTypes(): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.questions_types ORDER BY type ASC";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		return $results;
	}

	/**
	 * GetForProject function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetForProject(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.questions q WHERE q.id_projects = :ID ORDER BY q.order ASC, q.label ASC";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as &$result) {
			if ($result) {
				$result["possible_answers"] = json_decode($result["possible_answers"]);
			}
		}

		return $results ?: [];
	}
}
