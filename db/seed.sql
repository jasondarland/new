INSERT INTO roles (id,slug,name) VALUES
('r1','super_admin','Super Admin'),
('r2','internal_admin','Internal Admin'),
('r3','project_manager','Project Manager'),
('r4','engineering','Engineering'),
('r5','support','Support'),
('r6','sales','Sales'),
('r7','installer','Installer / Integrator'),
('r8','client_admin','Client Admin'),
('r9','client_user','Client User'),
('r10','accounting_licensing_manager','Accounting / Licensing Manager');

INSERT INTO companies (id,name,company_type,billing_email) VALUES
('c1','Show Systems International','internal','ops@showsystems.com'),
('c2','Oceanic Attractions Group','client','tech@oceanic-attractions.com');

INSERT INTO users (id,company_id,role_id,email,full_name,password_hash,status) VALUES
('u1','c1','r1','superadmin@ssi.demo','SSI Super Admin','DemoPass!123','active'),
('u2','c1','r3','pm@ssi.demo','Project Manager','DemoPass!123','active'),
('u3','c1','r5','support@ssi.demo','Support Engineer','DemoPass!123','active'),
('u4','c2','r8','clientadmin@ssi.demo','Client Admin','DemoPass!123','active'),
('u5','c2','r9','clientuser@ssi.demo','Client User','DemoPass!123','active');

INSERT INTO projects (id,company_id,name,code,overview,status,start_date,end_date,created_by) VALUES
('p1','c2','Abyss Dive Theater Upgrade','ABY-2025','Upgrade of show control and synchronization stack.','active','2025-01-10','2025-08-30','u2');

INSERT INTO milestones (id,project_id,title,due_date,status) VALUES
('m1','p1','Factory Acceptance Test','2025-04-15','in_progress'),
('m2','p1','Site Commissioning Complete','2025-08-20','pending');

INSERT INTO tasks (id,project_id,milestone_id,title,assignee_user_id,priority,status,due_date) VALUES
('t1','p1','m1','Finalize effects controller mapping','u2','high','in_progress','2025-03-25'),
('t2','p1','m2','Dry-run emergency shutdown sequence','u3','high','todo','2025-08-01');

INSERT INTO tickets (id,project_id,company_id,submitted_by_user_id,assigned_to_user_id,title,description,status,priority,sla_due_at) VALUES
('k1','p1','c2','u4','u3','Intermittent media server sync drift','Drift observed during peak load.','open','high','2025-03-14T18:00:00Z');

INSERT INTO licenses (id,key_value,company_id,project_id,product_code,status,feature_entitlements_json,issued_at,maintenance_status,created_by_user_id)
VALUES ('l1','SSI-IMMERSE-ABYSS-001','c2','p1','IMMERSE','active','["media_sync","redundancy","remote_diagnostics"]','2025-01-12','active','u1');

INSERT INTO downloads (id,project_id,product_code,title,release_notes,category,r2_key,entitlement_code)
VALUES ('d1','p1','IMMERSE','IMMERSE v4.2 Installer','Patch improvements for latency correction.','installer','downloads/immerse-v4.2.exe','media_sync');

INSERT INTO files (id,project_id,company_id,uploaded_by_user_id,category,title,r2_key,visibility)
VALUES ('f1','p1','c2','u2','commissioning','Commissioning Plan Rev B','docs/p1/commissioning-plan-revb.pdf','internal');

INSERT INTO commissioning_items (id,project_id,checklist_item,status)
VALUES ('ci1','p1','PLC safety handshake verified','done'),('ci2','p1','Control rack thermal load validation','pending');

INSERT INTO announcements (id,title,body,target_roles_json,posted_by_user_id,starts_at)
VALUES ('a1','Quarterly Firmware Window','Planned maintenance window starts Friday 22:00 UTC.','["support","engineering","project_manager"]','u1','2025-03-01T00:00:00Z');

INSERT INTO activity_logs (id,project_id,actor_user_id,action,metadata_json)
VALUES ('al1','p1','u2','project_created','{"source":"seed"}');
