using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Core
{
    public class Field<T>
    {
        Field(bool readOnly, bool hasValue, T value)
        {
            this.readOnly = readOnly;
            this.hasValue = hasValue;
            this.value = value;
        }

        public Field()
        {
        }

        public override string ToString()
        {
            if(!this.hasValue)
            {
                return "(n.v.)";
            }
            return this.value.ToString();
        }

        public T Value
        {
            get
            {
                return this.value;
            }
            set
            {
                if(this.readOnly)
                {
                    throw new InvalidOperationException("Field is read-only (1)");
                }
                this.value = value;
                this.hasValue = true;
            }
        }
        public bool HasValue
        {
            get
            {
                return this.hasValue;
            }
        }
        public Field<T> ReadOnly
        {
            get
            {
                return new Field<T>(true, this.hasValue, this.value);
            }
        }
        public T GetValue(T defaultValue)
        {
            if (this.hasValue)
            {
                return this.value;
            }
            return defaultValue;
        }
        public void CopyFrom(Dictionary<string, object> dictionary, string key)
        {
            if (this.readOnly)
            {
                throw new InvalidOperationException("Field is read-only (2)");
            }
            object newValue;
            if(dictionary.TryGetValue(key, out newValue))
            {
                this.Value = (T)newValue;
            }
            else
            {
                this.value = default(T);
                this.hasValue = false;
            }
        }
        public void CopyFrom(Field<T> field)
        {
            if (this.readOnly)
            {
                throw new InvalidOperationException("Field is read-only (2)");
            }
            if (!field.hasValue)
            {
                this.value = default(T);
                this.hasValue = false;
                return;
            }
            this.value = field.value;
            this.hasValue = true;
        }
        T value;
        bool hasValue = false;
        bool readOnly = false;
    }
}
