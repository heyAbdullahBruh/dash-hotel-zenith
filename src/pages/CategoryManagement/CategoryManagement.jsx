import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../../services/api/categoryService";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Modal from "../../components/ui/Modal/Modal";
import ImageUploader from "../../components/shared/ImageUploader/ImageUploader";
import StatusBadge from "../../components/shared/StatusBadge/StatusBadge";
import {
  faPlus,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./CategoryManagement.module.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
  displayOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");

  const { data: categories, } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAllCategories(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      displayOrder: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => categoryService.toggleCategoryStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleEdit = (category) => {
    setEditingCategory(category);
    Object.keys(categorySchema.shape).forEach((key) => {
      if (category[key] !== undefined) {
        setValue(key, category[key]);
      }
    });
    setImages(category.image ? [category.image] : []);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      image: images[0],
    };

    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory._id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const resetForm = () => {
    reset();
    setEditingCategory(null);
    setImages([]);
    setShowForm(false);
  };

  const filteredCategories = categories?.filter(
    (category) =>
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.categoryManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Category Management</h1>
          <p className={styles.subtitle}>Organize your menu into categories</p>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => setShowForm(true)}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className={styles.searchCard}>
        <Input
          placeholder="Search categories..."
          icon={faSearch}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Card>

      {/* Categories Grid */}
      <div className={styles.categoriesGrid}>
        {filteredCategories?.map((category) => (
          <Card key={category._id} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              {category.image && (
                <div className={styles.categoryImage}>
                  <img src={category.image} alt={category.name} />
                </div>
              )}
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <div className={styles.categoryMeta}>
                  <StatusBadge
                    status={category.isActive ? "active" : "inactive"}
                    type="status"
                  />
                  <span className={styles.categoryOrder}>
                    Order: {category.displayOrder}
                  </span>
                </div>
              </div>
            </div>

            {category.description && (
              <p className={styles.categoryDescription}>
                {category.description}
              </p>
            )}

            <div className={styles.categoryStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {category.foodCount || 0}
                </span>
                <span className={styles.statLabel}>Items</span>
              </div>
            </div>

            <div className={styles.categoryActions}>
              <Button
                variant="outline"
                size="sm"
                icon={faEdit}
                onClick={() => handleEdit(category)}
              >
                Edit
              </Button>
              <Button
                variant={category.isActive ? "warning" : "success"}
                size="sm"
                icon={category.isActive ? faToggleOff : faToggleOn}
                onClick={() => toggleStatusMutation.mutate(category._id)}
                loading={toggleStatusMutation.isPending}
              >
                {category.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={faTrash}
                onClick={() => handleDelete(category._id)}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Category Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.categoryForm}>
          <div className={styles.formGrid}>
            <div className={styles.formColumn}>
              <Input
                label="Category Name"
                placeholder="Enter category name"
                error={errors.name?.message}
                {...register("name")}
                fullWidth
              />

              <Input
                label="Display Order"
                type="number"
                placeholder="0"
                error={errors.displayOrder?.message}
                {...register("displayOrder", { valueAsNumber: true })}
                fullWidth
              />

              <div className={styles.formCheckbox}>
                <label>
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className={styles.checkbox}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label>Description (optional)</label>
                <textarea
                  className={styles.textarea}
                  {...register("description")}
                  placeholder="Enter category description"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category Image</label>
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={1}
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
