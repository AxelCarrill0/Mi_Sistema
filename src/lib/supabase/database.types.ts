export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          descripcion: string | null
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          actualizado_en: string
          creado_en: string
          direccion: string | null
          email: string | null
          id: string
          identificacion: string | null
          nombres: string
          notas: string | null
          telefono: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          direccion?: string | null
          email?: string | null
          id?: string
          identificacion?: string | null
          nombres: string
          notas?: string | null
          telefono?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          direccion?: string | null
          email?: string | null
          id?: string
          identificacion?: string | null
          nombres?: string
          notas?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      colecciones: {
        Row: {
          actualizado_en: string
          creado_en: string
          descripcion: string | null
          estado_publicacion: string
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          estado_publicacion?: string
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          estado_publicacion?: string
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      configuracion_negocio: {
        Row: {
          actualizado_en: string
          id: number
          mostrar_precios_publicos: boolean
          nombre_negocio: string
        }
        Insert: {
          actualizado_en?: string
          id: number
          mostrar_precios_publicos?: boolean
          nombre_negocio?: string
        }
        Update: {
          actualizado_en?: string
          id?: number
          mostrar_precios_publicos?: boolean
          nombre_negocio?: string
        }
        Relationships: []
      }
      configuracion_whatsapp: {
        Row: {
          actualizado_en: string
          id: number
          mensaje_predeterminado: string | null
          numero_whatsapp: string | null
        }
        Insert: {
          actualizado_en?: string
          id: number
          mensaje_predeterminado?: string | null
          numero_whatsapp?: string | null
        }
        Update: {
          actualizado_en?: string
          id?: number
          mensaje_predeterminado?: string | null
          numero_whatsapp?: string | null
        }
        Relationships: []
      }
      cotizaciones: {
        Row: {
          actualizado_en: string
          cliente_id: string | null
          creado_en: string
          direccion_cliente: string | null
          email_cliente: string | null
          estado: string
          id: string
          nombre_cliente: string
          numero: number
          observaciones: string | null
          telefono_cliente: string | null
          vigencia_dias: number
        }
        Insert: {
          actualizado_en?: string
          cliente_id?: string | null
          creado_en?: string
          direccion_cliente?: string | null
          email_cliente?: string | null
          estado?: string
          id?: string
          nombre_cliente: string
          numero?: number
          observaciones?: string | null
          telefono_cliente?: string | null
          vigencia_dias?: number
        }
        Update: {
          actualizado_en?: string
          cliente_id?: string | null
          creado_en?: string
          direccion_cliente?: string | null
          email_cliente?: string | null
          estado?: string
          id?: string
          nombre_cliente?: string
          numero?: number
          observaciones?: string | null
          telefono_cliente?: string | null
          vigencia_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_detalle: {
        Row: {
          cantidad: number
          cotizacion_id: string
          creado_en: string
          descripcion: string
          id: string
          precio_unitario: number
          producto_id: string | null
        }
        Insert: {
          cantidad?: number
          cotizacion_id: string
          creado_en?: string
          descripcion: string
          id?: string
          precio_unitario: number
          producto_id?: string | null
        }
        Update: {
          cantidad?: number
          cotizacion_id?: string
          creado_en?: string
          descripcion?: string
          id?: string
          precio_unitario?: number
          producto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_detalle_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_detalle_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      imagenes_producto: {
        Row: {
          creado_en: string
          es_principal: boolean
          id: string
          orden: number
          producto_id: string
          ruta_storage: string
          texto_alternativo: string | null
        }
        Insert: {
          creado_en?: string
          es_principal?: boolean
          id?: string
          orden?: number
          producto_id: string
          ruta_storage: string
          texto_alternativo?: string | null
        }
        Update: {
          creado_en?: string
          es_principal?: boolean
          id?: string
          orden?: number
          producto_id?: string
          ruta_storage?: string
          texto_alternativo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imagenes_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          id: string
          nombre_completo: string | null
          rol: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          id: string
          nombre_completo?: string | null
          rol?: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          id?: string
          nombre_completo?: string | null
          rol?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          actualizado_en: string
          categoria_id: string | null
          codigo_interno: string
          coleccion_id: string | null
          colores_acabados: string | null
          controla_stock: boolean
          creado_en: string
          descripcion: string | null
          destacado: boolean
          estado_publicacion: string
          id: string
          materiales: string | null
          medidas: string | null
          mensaje_whatsapp: string | null
          nombre: string
          precio_base: number | null
          slug: string
          stock_actual: number
          tiempo_elaboracion: string | null
          tipo_producto: string
        }
        Insert: {
          actualizado_en?: string
          categoria_id?: string | null
          codigo_interno: string
          coleccion_id?: string | null
          colores_acabados?: string | null
          controla_stock?: boolean
          creado_en?: string
          descripcion?: string | null
          destacado?: boolean
          estado_publicacion?: string
          id?: string
          materiales?: string | null
          medidas?: string | null
          mensaje_whatsapp?: string | null
          nombre: string
          precio_base?: number | null
          slug: string
          stock_actual?: number
          tiempo_elaboracion?: string | null
          tipo_producto: string
        }
        Update: {
          actualizado_en?: string
          categoria_id?: string | null
          codigo_interno?: string
          coleccion_id?: string | null
          colores_acabados?: string | null
          controla_stock?: boolean
          creado_en?: string
          descripcion?: string | null
          destacado?: boolean
          estado_publicacion?: string
          id?: string
          materiales?: string | null
          medidas?: string | null
          mensaje_whatsapp?: string | null
          nombre?: string
          precio_base?: number | null
          slug?: string
          stock_actual?: number
          tiempo_elaboracion?: string | null
          tipo_producto?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "colecciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
