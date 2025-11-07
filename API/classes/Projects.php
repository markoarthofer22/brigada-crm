<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;
use PP\Classes\Settings;
use PP\Classes\Questions;

/**
 * Projects class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Projects
{

	protected $database;
	protected $folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
		$this->folder = "../files/projects";
	}

	/**
	 * GetAll function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll($params): array
	{

		$Helper = new Helper($this->database);

		$where = " WHERE 1=1 ";
		if (isset($params) && $params->type) {
			$where .= "AND p.type = :TYPE";
		}

		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.projects p
				$where
				AND p.deleted_at IS NULL
				ORDER BY p.created_at DESC
		";

		$stmt = $this->database->prepare($sql);
		if (isset($params) && $params->type) {
			$stmt->bindParam(':TYPE', $params->type, PDO::PARAM_INT);
		}
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
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
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.projects p WHERE p.id_projects = :ID AND deleted_at IS NULL";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["data"] = json_decode($result["data"]);
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

		$Settings = new Settings($this->database);
		$Questions = new Questions($this->database);

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.projects
					(data)
				VALUES 
					(:DATA)
				RETURNING id_projects
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		$id_projects = (int)$result['id_projects'];

		if (!isset($params->data->from_template) || !$params->data->from_template) {
			/// ADD DEFAULT STATIC QUESTIONS TO PROJECT
			$default_static_questions = $Settings->Get((object)array("key" => "static_questions"));
			foreach ($default_static_questions["value"] as $key => $value) {
				$params = new stdClass;
				$params->id_projects = $id_projects;
				$params->id_zones = null;
				$params->label = $value->label;
				$params->id_questions_types = $value->id_questions_types;
				$params->possible_answers = $value->possible_answers;
				$params->data = array("static" => true, "required" => true, "true_id" => $value->id_questions, "filter" => $value->filter);
				$parent_id = $Questions->Add($params);

				foreach ($value->subquestions as $k => $v) {
					$params = new stdClass;
					$params->id_projects = $id_projects;
					$params->id_zones = null;
					$params->label = $v->label;
					$params->id_questions_types = $v->id_questions_types;
					$params->possible_answers = $v->possible_answers;
					$params->data = array("static" => true, "required" => true, "parent_id" => $parent_id, "filter" => $v->filter);
					$Questions->Add($params);
				}
			}
		} else {

			// STATIC QUESTIONS
			$sql = "SELECT *
					FROM {$_SESSION["SCHEMA"]}.questions 
					WHERE id_projects = :ID_PROJECTS AND id_zones IS NULL AND jsonb_exists(data, 'static')
			";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':ID_PROJECTS', $params->data->from_template);
			$stmt->execute();
			$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

			foreach ($results as $r) {
				$r["data"] = json_decode($r["data"]);
				$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.questions (id_projects,id_zones,label,id_questions_types,possible_answers,\"order\",data)
							VALUES
							(:ID_PROJECTS_NEW,null,:LABEL,:ID_QUESTIONS_TYPES,:POSSIBLE_ANSWERS,:ORDER,:DATA)
							RETURNING id_questions
				";
				$r["data"]->old_id = $r["id_questions"];
				$stmt = $this->database->prepare($sql);
				$stmt->bindParam(':ID_PROJECTS_NEW', $id_projects);
				$stmt->bindParam(':LABEL', $r["label"]);
				$stmt->bindParam(':ID_QUESTIONS_TYPES', $r["id_questions_types"]);
				$stmt->bindParam(':POSSIBLE_ANSWERS', $r["possible_answers"]);
				$stmt->bindParam(':ORDER', $r["order"]);
				$stmt->bindParam(':DATA', json_encode($r["data"]));
				$stmt->execute();
			}

			$sql = "UPDATE {$_SESSION["SCHEMA"]}.questions AS q1
					SET data = jsonb_set(
								q1.data - 'old_id',
								'{parent_id}',
								to_jsonb(q2.id_questions)
							)
					FROM {$_SESSION["SCHEMA"]}.questions AS q2
					WHERE q1.data->>'parent_id' = q2.data->>'old_id'
					AND q1.id_projects = :ID_PROJECTS_NEW_1
					AND q2.id_projects = :ID_PROJECTS_NEW_2
					AND q2.id_questions = (
						SELECT q3.id_questions
						FROM {$_SESSION["SCHEMA"]}.questions AS q3
						WHERE q3.data->>'old_id' = q1.data->>'parent_id'
							AND q3.id_projects = :ID_PROJECTS_NEW_3
						ORDER BY q3.id_questions
						LIMIT 1
					);
			";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':ID_PROJECTS_NEW_1', $id_projects);
			$stmt->bindParam(':ID_PROJECTS_NEW_2', $id_projects);
			$stmt->bindParam(':ID_PROJECTS_NEW_3', $id_projects);
			$stmt->execute();
		}

		return $id_projects;
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

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.projects 
				SET 
					data = :DATA
				WHERE id_projects = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ID', $params->id);
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
		// $sql = "DELETE FROM {$_SESSION["SCHEMA"]}.projects 
		// 		WHERE id_projects = :ID
		// ";
		$sql = "UPDATE {$_SESSION["SCHEMA"]}.projects 
				SET deleted_at = NOW()
				WHERE id_projects = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * ConnectProjectsImages function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function ConnectProjectsImages(object $params): bool
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.projects_images (id_projects, id_images) VALUES (:ID_PROJECTS, :ID_IMAGES)";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_IMAGES', $params->id_images);
		$stmt->execute();

		return true;
	}

	/**
	 * DisconnectProjectsImages function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function DisconnectProjectsImages(object $params): bool
	{

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.projects_images WHERE id_projects = :ID_PROJECTS AND id_images = :ID_IMAGES";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_IMAGES', $params->id_images);
		$stmt->execute();

		return true;
	}

	/**
	 * GetImages function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetImages(object $params): array
	{

		$sql = "SELECT 
					i.* 
				FROM {$_SESSION["SCHEMA"]}.projects_images pi
				LEFT JOIN {$_SESSION["SCHEMA"]}.images i ON pi.id_images = i.id_images
				WHERE pi.id_projects = :ID_PROJECTS
				ORDER BY i.name ASC
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
		}

		return $results;
	}

	/**
	 * Copy function
	 *
	 * @param object $params
	 * @return bool
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Copy(object $params): bool
	{

		// IMAGES
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.projects_images WHERE id_projects = :ID_PROJECTS";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->execute();
		$images = $stmt->fetchAll(PDO::FETCH_ASSOC);

		$uploadedImages = [];
		foreach ($images as $image) {
			$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.images WHERE id_images = :ID_IMAGES";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':ID_IMAGES', $image["id_images"]);
			$stmt->execute();
			$r = $stmt->fetch(PDO::FETCH_ASSOC);

			$info = pathinfo($r['name']);

			$fileExtension = $info['extension'];
			$fileName = uniqid('', true) . '.' . $fileExtension;
			$data = $r['data'];

			$sql = "INSERT INTO {$_SESSION['SCHEMA']}.images (name, data) VALUES (:NAME, :DATA) RETURNING id_images";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':NAME', $fileName, PDO::PARAM_STR);
			$stmt->bindParam(':DATA', $data, PDO::PARAM_STR); // JSONB is passed as string
			$stmt->execute();
			$result = $stmt->fetch(PDO::FETCH_ASSOC);

			$old_file = rtrim($this->folder, '/') . '/' . $r['name'];
			$new_file = rtrim($this->folder, '/') . '/' . $fileName;
			copy($old_file, $new_file);

			$uploadedImages[] = ["id_images_new" => $result['id_images'], "id_images_old" => $image["id_images"]];
		}

		// echo "<pre>";
		// print_r($uploadedImages);
		// exit;

		// PROJECTS
		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.projects (data)
				SELECT jsonb_set(
						data, 
						'{name}', 
						to_jsonb((data->>'name') || ' copy')
					)
				FROM {$_SESSION["SCHEMA"]}.projects
				WHERE id_projects = :ID_PROJECTS
				RETURNING id_projects
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		$id_projects_new = $result['id_projects'];

		// CONNECT IMAGES TO NEW PROJECT
		foreach ($uploadedImages as $image) {
			$this->ConnectProjectsImages((object)["id_projects" => $id_projects_new, "id_images" => $image["id_images_new"]]);

			// ZONES
			// $sql = "WITH inserted AS (
			// 			INSERT INTO {$_SESSION["SCHEMA"]}.zones (id_projects, id_images, name, coordinates, data)
			// 			SELECT 
			// 				:ID_PROJECTS_NEW,
			// 				:ID_IMAGES_NEW,
			// 				name,
			// 				coordinates,
			// 				data
			// 			FROM {$_SESSION["SCHEMA"]}.zones
			// 			WHERE id_projects = :ID_PROJECTS AND id_images = :ID_IMAGES
			// 			RETURNING id_zones
			// 		)
			// 		SELECT 
			// 			inserted.id_zones AS id_zones_new,
			// 			z.id_zones AS id_zones_old
			// 		FROM inserted, {$_SESSION["SCHEMA"]}.zones z
			// 		WHERE z.id_projects = :ID_PROJECTS AND z.id_images = :ID_IMAGES;
			// ";
			$sql = "WITH source AS (
						SELECT 
							id_zones AS id_zones_old,
							name,
							coordinates,
							data
						FROM {$_SESSION["SCHEMA"]}.zones
						WHERE id_projects = :ID_PROJECTS AND id_images = :ID_IMAGES
					),
					inserted AS (
						INSERT INTO {$_SESSION["SCHEMA"]}.zones (id_projects, id_images, name, coordinates, data)
						SELECT 
							:ID_PROJECTS_NEW,
							:ID_IMAGES_NEW,
							name,
							coordinates,
							data
						FROM source
						RETURNING id_zones AS id_zones_new, name, id_projects
					)
					SELECT inserted.id_zones_new, source.id_zones_old from inserted
					JOIN source on inserted.name = source.name
					";
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
			$stmt->bindParam(':ID_PROJECTS_NEW', $id_projects_new);
			$stmt->bindParam(':ID_IMAGES_NEW', $image["id_images_new"]);
			$stmt->bindParam(':ID_IMAGES', $image["id_images_old"]);
			$stmt->execute();
			$new_zones = $stmt->fetchAll(PDO::FETCH_ASSOC);
			// echo "<pre>";
			// print_r($new_zones);
			// exit;

			// echo "<pre>";
			// echo "OLD ZONE ID: " . $id_zones_old . " => NEW ZONE ID: " . $id_zones_new . "\n";

			foreach ($new_zones as $nz) {
				$id_zones_new = $nz['id_zones_new'];
				$id_zones_old = $nz['id_zones_old'];

				// QUESTIONS WITHIN ZONES
				$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.questions (id_projects,id_zones,label,id_questions_types,possible_answers,\"order\",data)
						SELECT :ID_PROJECTS_NEW,:ID_ZONES_NEW,label,id_questions_types,possible_answers,\"order\",data FROM {$_SESSION["SCHEMA"]}.questions WHERE id_projects = :ID_PROJECTS AND id_zones = :ID_ZONES_OLD
				";
				// echo "sql: " . $sql . "\n";
				// echo "old zone id: " . $id_zones_old . " => new zone id: " . $id_zones_new . "\n";
				// echo "old project id: " . $params->id_projects . " => new project id: " . $id_projects_new . "\n\n";
				$stmt = $this->database->prepare($sql);
				$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
				$stmt->bindParam(':ID_PROJECTS_NEW', $id_projects_new);
				$stmt->bindParam(':ID_ZONES_NEW', $id_zones_new);
				$stmt->bindParam(':ID_ZONES_OLD', $id_zones_old);
				$stmt->execute();
				$result = $stmt->fetch(PDO::FETCH_ASSOC);
			}
		}
		// exit;


		// QUESTIONS WITHOUT ZONES
		// NON STATIC QUESTIONS
		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.questions (id_projects,id_zones,label,id_questions_types,possible_answers,\"order\",data)
				SELECT :ID_PROJECTS_NEW,null,label,id_questions_types,possible_answers,\"order\",data 
				FROM {$_SESSION["SCHEMA"]}.questions 
				WHERE id_projects = :ID_PROJECTS AND id_zones IS NULL AND NOT jsonb_exists(data, 'static')
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_PROJECTS_NEW', $id_projects_new);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		// STATIC QUESTIONS
		$sql = "SELECT *
				FROM {$_SESSION["SCHEMA"]}.questions 
				WHERE id_projects = :ID_PROJECTS AND id_zones IS NULL AND jsonb_exists(data, 'static')
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as $r) {
			$r["data"] = json_decode($r["data"]);
			$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.questions (id_projects,id_zones,label,id_questions_types,possible_answers,\"order\",data)
						VALUES
						(:ID_PROJECTS_NEW,null,:LABEL,:ID_QUESTIONS_TYPES,:POSSIBLE_ANSWERS,:ORDER,:DATA)
						RETURNING id_questions
			";
			$r["data"]->old_id = $r["id_questions"];
			$stmt = $this->database->prepare($sql);
			$stmt->bindParam(':ID_PROJECTS_NEW', $id_projects_new);
			$stmt->bindParam(':LABEL', $r["label"]);
			$stmt->bindParam(':ID_QUESTIONS_TYPES', $r["id_questions_types"]);
			$stmt->bindParam(':POSSIBLE_ANSWERS', $r["possible_answers"]);
			$stmt->bindParam(':ORDER', $r["order"]);
			$stmt->bindParam(':DATA', json_encode($r["data"]));
			$stmt->execute();
		}

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.questions AS q1
				SET data = jsonb_set(
							q1.data - 'old_id',
							'{parent_id}',
							to_jsonb(q2.id_questions)
						)
				FROM {$_SESSION["SCHEMA"]}.questions AS q2
				WHERE q1.data->>'parent_id' = q2.data->>'old_id'
				AND q1.id_projects = :ID_PROJECTS_NEW_1
				AND q2.id_projects = :ID_PROJECTS_NEW_2
				AND q2.id_questions = (
					SELECT q3.id_questions
					FROM {$_SESSION["SCHEMA"]}.questions AS q3
					WHERE q3.data->>'old_id' = q1.data->>'parent_id'
						AND q3.id_projects = :ID_PROJECTS_NEW_3
					ORDER BY q3.id_questions
					LIMIT 1
				);
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS_NEW_1', $id_projects_new);
		$stmt->bindParam(':ID_PROJECTS_NEW_2', $id_projects_new);
		$stmt->bindParam(':ID_PROJECTS_NEW_3', $id_projects_new);
		$stmt->execute();

		return true;
	}
}
