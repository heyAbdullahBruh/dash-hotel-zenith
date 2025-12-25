import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foodService } from "../../../services/api/foodService";
import { categoryService } from "../../../services/api/categoryService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Select from "../../../components/ui/Select/Select";
import Textarea from "../../../components/ui/Textarea/Textarea";
import ImageUploader from "../../../components/shared/ImageUploader/ImageUploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FoodForm.module.css";

const foodSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  discount: z.number().min(0).max(1000).optional(),
  category: z.string().min(1, "Category is required"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  nutritionalInfo: z
    .object({
      calories: z.number().positive("Calories must be positive").optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
    })
    .optional(),
  preparationTime: z.number().min(1).optional(),
  isAvailable: z.boolean().default(true),
  stock: z.number().min(0).default(0),
});

const FoodForm = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const isEditing = !!foodId;

  // Fetch food data if editing
  const { data: foodData, isLoading: foodLoading } = useQuery({
    queryKey: ["food", foodId],
    queryFn: () => foodService.getFood(foodId),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAllCategories(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      ingredients: [],
      nutritionalInfo: {},
      isAvailable: true,
      stock: 0,
    },
  });

  const ingredients = watch("ingredients");

  // Set form values when food data is loaded
  useEffect(() => {
    if (foodData && isEditing) {
      Object.keys(foodData).forEach((key) => {
        if (key in foodSchema.shape) {
          setValue(key, foodData[key]);
        }
      });
      setImages(foodData.images || []);
    }
  }, [foodData, isEditing, setValue]);

  const createMutation = useMutation({
    mutationFn: (data) => foodService.createFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      navigate("/foods");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => foodService.updateFood(foodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["food", foodId] });
      navigate("/foods");
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        images,
      };

      if (isEditing) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Error saving food:", error);
    }
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setValue("ingredients", [...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setValue("ingredients", newIngredients);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  if (foodLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.foodForm}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEditing ? "Edit Food Item" : "Add New Food Item"}
        </h1>
        <Button
          variant="outline"
          icon={faTimes}
          onClick={() => navigate("/foods")}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formColumns}>
          {/* Left Column - Basic Info */}
          <div className={styles.column}>
            <Card className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>

              <Input
                label="Food Name"
                placeholder="Enter food name"
                error={errors.name?.message}
                {...register("name")}
                fullWidth
              />

              <Textarea
                label="Description"
                placeholder="Describe the food item..."
                rows={4}
                error={errors.description?.message}
                {...register("description")}
                fullWidth
              />

              <div className={styles.row}>
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.price?.message}
                  {...register("price", { valueAsNumber: true })}
                  fullWidth
                />
                <Input
                  label="Discount ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.discount?.message}
                  {...register("discount", { valueAsNumber: true })}
                  fullWidth
                />
              </div>

              <Select
                label="Category"
                options={
                  categories?.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  })) || []
                }
                value={watch("category")}
                onChange={(value) => setValue("category", value)}
                error={errors.category?.message}
                placeholder="Select category"
                required
              />
            </Card>

            <Card className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Ingredients</h3>

              <div className={styles.ingredientsInput}>
                <Input
                  placeholder="Add an ingredient and press Enter"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  fullWidth
                />
                <Button
                  type="button"
                  variant="outline"
                  icon={faPlus}
                  onClick={handleAddIngredient}
                >
                  Add
                </Button>
              </div>

              {errors.ingredients?.message && (
                <div className={styles.errorText}>
                  {errors.ingredients.message}
                </div>
              )}

              <div className={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <div key={index} className={styles.ingredientTag}>
                    <span>{ingredient}</span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={faMinus}
                      onClick={() => handleRemoveIngredient(index)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Images & Details */}
          <div className={styles.column}>
            <Card className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Food Images</h3>
              <ImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </Card>

            <Card className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Nutritional Information</h3>

              <div className={styles.nutritionGrid}>
                <Input
                  label="Calories"
                  type="number"
                  placeholder="0"
                  {...register("nutritionalInfo.calories", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  {...register("nutritionalInfo.protein", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  label="Carbs (g)"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  {...register("nutritionalInfo.carbs", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  {...register("nutritionalInfo.fat", { valueAsNumber: true })}
                />
              </div>
            </Card>

            <Card className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Inventory & Availability</h3>

              <div className={styles.row}>
                <Input
                  label="Stock Quantity"
                  type="number"
                  placeholder="0"
                  {...register("stock", { valueAsNumber: true })}
                  fullWidth
                />
                <Input
                  label="Preparation Time (minutes)"
                  type="number"
                  placeholder="0"
                  {...register("preparationTime", { valueAsNumber: true })}
                  fullWidth
                />
              </div>

              <div className={styles.availability}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    {...register("isAvailable")}
                    className={styles.checkbox}
                  />
                  <span>Available for order</span>
                </label>
              </div>
            </Card>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={faSave}
            loading={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {isEditing ? "Update Food Item" : "Create Food Item"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FoodForm;
