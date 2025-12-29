import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { authService } from "../../services/api/authService";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Modal from "../../components/ui/Modal/Modal";
import StatusBadge from "../../components/shared/StatusBadge/StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faUser,
  faShield,
  faEnvelope,
  faPhone,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AdminManagement.module.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password Must 6 length"),
  role: z.enum(["admin", "super_admin"]).default("admin"),
});

const AdminManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [search, setSearch] = useState("");

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => authService.getAllAdmins(),
    enabled: user?.role === "super_admin",
  });
  console.log(admins);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: "admin",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => authService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      resetForm();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (adminId) => authService.toggleAdminStatus(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    Object.keys(adminSchema.shape).forEach((key) => {
      if (admin[key] !== undefined) {
        setValue(key, admin[key]);
      }
    });
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    if (editingAdmin) {
      // Update admin logic here
      console.log("Update admin:", editingAdmin._id, data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const resetForm = () => {
    reset();
    setEditingAdmin(null);
    setShowForm(false);
  };

  const filteredAdmins = admins?.filter(
    (admin) =>
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase())
  );

  if (user?.role !== "super_admin") {
    return (
      <div className={styles.unauthorized}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Admin Management</h1>
          <p className={styles.subtitle}>
            Manage system administrators and permissions
          </p>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => setShowForm(true)}
          >
            Add Admin
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className={styles.searchCard}>
        <Input
          placeholder="Search admins..."
          icon={faSearch}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Card>

      {/* Admins Grid */}
      <div className={styles.adminsGrid}>
        {filteredAdmins?.map((admin) => (
          <Card key={admin._id} className={styles.adminCard}>
            <div className={styles.adminHeader}>
              <div className={styles.adminAvatar}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className={styles.adminInfo}>
                <h3 className={styles.adminName}>{admin.name}</h3>
                <div className={styles.adminMeta}>
                  <StatusBadge
                    status={admin.isActive ? "active" : "inactive"}
                    type="status"
                  />
                  <div className={styles.adminRole}>
                    <FontAwesomeIcon icon={faShield} />
                    <span>{admin.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.adminDetails}>
              <div className={styles.detailItem}>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{admin.email}</span>
              </div>
              {admin.phone && (
                <div className={styles.detailItem}>
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{admin.phone}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <FontAwesomeIcon icon={faCalendar} />
                <span>
                  Joined {format(new Date(admin.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            <div className={styles.adminActions}>
              {admin._id !== user._id && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={faEdit}
                    onClick={() => handleEdit(admin)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={admin.isActive ? "warning" : "success"}
                    size="sm"
                    icon={admin.isActive ? faToggleOff : faToggleOn}
                    onClick={() => toggleStatusMutation.mutate(admin._id)}
                    loading={toggleStatusMutation.isPending}
                  >
                    {admin.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  {admin.role !== "super_admin" && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={faTrash}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${admin.name}?`
                          )
                        ) {
                          // Delete admin logic
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Admin Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingAdmin ? "Edit Admin" : "Add New Admin"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.adminForm}>
          <Input
            label="Full Name"
            placeholder="Enter admin's full name"
            error={errors.name?.message}
            {...register("name")}
            fullWidth
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@hotelzenith.com"
            error={errors.email?.message}
            {...register("email")}
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            placeholder="*******"
            error={errors.password?.message}
            {...register("password")}
            fullWidth
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+1 (555) 123-4567"
            error={errors.phone?.message}
            {...register("phone")}
            fullWidth
          />

          <div className={styles.formGroup}>
            <label>Role</label>
            <div className={styles.roleOptions}>
              <label className={styles.roleOption}>
                <input
                  type="radio"
                  value="admin"
                  {...register("role")}
                  className={styles.radio}
                />
                <div className={styles.roleContent}>
                  <FontAwesomeIcon icon={faUser} />
                  <div>
                    <strong>Admin</strong>
                    <p>Manage daily operations</p>
                  </div>
                </div>
              </label>

              <label className={styles.roleOption}>
                <input
                  type="radio"
                  value="super_admin"
                  {...register("role")}
                  className={styles.radio}
                />
                <div className={styles.roleContent}>
                  <FontAwesomeIcon icon={faShield} />
                  <div>
                    <strong>Super Admin</strong>
                    <p>Full system access</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending}
            >
              {editingAdmin ? "Update Admin" : "Create Admin"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminManagement;
