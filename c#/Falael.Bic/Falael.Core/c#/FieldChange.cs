using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Core
{
    public class FieldChange<T>
    {
        public FieldChange(Func<T, T, bool> equalsCallback)
        {
            this.equalsCallback = equalsCallback;
        }

        public FieldChange()
        {
        }

        public Field<T> Field
        {
            get
            {
                return this.field;
            }
        }
        public Field<T> OldField
        {
            get
            {
                return this.oldField;
            }
        }
        public bool HasChange
        {
            get
            {
                if(this.field.HasValue != this.oldField.HasValue)
                {
                    return true;
                }
                if (this.field.HasValue == false)
                {
                    return false;
                }
                if (this.field.Value == null)
                {
                    if (this.oldField.Value == null)
                    {
                        return false;
                    }
                    return true;
                }
                if (this.oldField.Value == null)
                {
                    return true;
                }

                if(this.equalsCallback != null)
                {
                    return this.equalsCallback(this.field.Value, this.oldField.Value);
                }

                return this.field.Value.Equals(this.oldField.Value);
            }
        }

        Field<T> field = new Field<T>();
        Field<T> oldField = new Field<T>();
        Func<T, T, bool> equalsCallback;
    }
}
